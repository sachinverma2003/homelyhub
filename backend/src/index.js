import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";

import { router as userRoutes } from "./routes/userRoutes.js";
import { propertyRouter } from "./routes/propertyRouter.js";
import { bookingRouter } from "./routes/bookingRouter.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// ------------------ ✅ CORS CONFIG ------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://stellar-jelly-2126bf.netlify.app", // ✅ Netlify frontend
  "https://homelyhub-s6uq.onrender.com"       // ✅ Backend (Render)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Blocked: Origin not allowed - " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
app.set("trust proxy", 1); // ✅ Needed for cookies in production (Render)

// ------------------ ✅ MIDDLEWARES ------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ------------------ ✅ DATABASE ------------------
connectDB();

// ------------------ ✅ ROUTES ------------------
app.use("/v1/rent/user", userRoutes);
app.use("/v1/rent/listing", propertyRouter);
app.use("/v1/rent/user/booking", bookingRouter);

// ------------------ ✅ ROOT ROUTE ------------------
app.get("/", (req, res) => {
  res.send("✅ HomelyHub backend is live and running on Render!");
});

// ------------------ ✅ SERVER START ------------------
app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
