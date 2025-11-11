import { User } from "../Models/userModel.js";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ImageKit from "../utils/ImagekitIO.js";
import { forgotPasswordMailGenContent, sendMail } from "../utils/mail.js";

// Generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Send JWT via secure cookie + response body
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,       // Required when frontend & backend are on HTTPS
    sameSite: "none",   // Required for Netlify <-> Render cross-domain
    path: "/",
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: "Success",
    token,
    user,
  });
};

// Default Avatar
const defaultAvatarUrl = "https://i.pravatar.cc/150?img=3";

// Sign Up
export const signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      avatar: { url: req.body.avatar || defaultAvatarUrl },
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw new Error("Please provide email and password");

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password)))
      throw new Error("Incorrect email or password");

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Logout
export const logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

// Protect Middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt && req.cookies.jwt !== "loggedout") {
      token = req.cookies.jwt;
    }

    if (!token) throw new Error("Not logged in. Please log in first.");

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser)
      throw new Error("User no longer exists.");

    if (currentUser.changedPasswordAfter(decoded.iat))
      throw new Error("User recently changed password. Please log in again.");

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Update Profile
export const updateMe = async (req, res) => {
  try {
    const filteredData = ((obj, ...allowed) => {
      const newObj = {};
      Object.keys(obj).forEach((key) => {
        if (allowed.includes(key)) newObj[key] = obj[key];
      });
      return newObj;
    })(req.body, "name", "phoneNumber", "avatar");

    if (req.body.avatar) {
      const uploaded = await ImageKit.upload({
        file: req.body.avatar,
        fileName: `avatar_${Date.now()}.jpg`,
        folder: "avatars",
      });

      filteredData.avatar = {
        public_id: uploaded.fileId,
        url: uploaded.url,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: "Success", data: { user: updatedUser } });
  } catch (err) {
    res.status(400).json({ status: "Fail", message: err.message });
  }
};

// Update Password
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
      throw new Error("Incorrect current password");

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ error: "No user with this email" });

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `https://stellar-jelly-2126bf.netlify.app/user/resetPassword/${resetToken}`;

  try {
    await sendMail({
      email: user.email,
      subject: "Reset your password (valid for 10 mins)",
      mailGenContent: forgotPasswordMailGenContent(user.name, resetURL),
    });

    res.status(200).json({
      status: "success",
      message: "Reset link sent to email",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new Error("Token invalid or expired");

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Check Auth (Used for /user/me)
export const check = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Logged In",
    user: req.user,
  });
};
