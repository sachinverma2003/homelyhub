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
const port = process.env.PORT || 8081;


// ------------------ CORS CONFIG ------------------

// Frontend URLs allowed to call the backend
const allowedOrigins = [
  "http://localhost:5173",          // local frontend Vite
  "http://localhost:5174",          // alternate vite port
  "https://stellar-jelly-2126bf.netlify.app" // your live frontend
];

// CORS middleware (supports cookies + Render)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("❌ CORS Blocked: " + origin));
    },
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors());

// Required for Render for cookies to work
app.set("trust proxy", 1);


// ------------------ MIDDLEWARE ------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Connect to database
connectDB();


// ------------------ ROUTES ------------------
app.use("/v1/rent/user", userRoutes);
app.use("/v1/rent/listing", propertyRouter);
app.use("/v1/rent/user/booking", bookingRouter);


// ------------------ SERVER ------------------
app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
