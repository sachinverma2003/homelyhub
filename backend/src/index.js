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
// Setting fallback port to 8080 or the one provided by Render/env
const port = process.env.PORT || 8080; 

// ----------------------------------------------------------------------
// 1. CRITICAL FIX: TRUST PROXY
// This is essential for secure cookies (sessions) to work behind Render's HTTPS proxy.
// It tells Express to trust the X-Forwarded-* headers.
app.set("trust proxy", 1); 

// 2. CRITICAL FIX: DYNAMIC CORS CHECK
// This allows the Netlify domain to connect dynamically.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173", "http://localhost:8080"]; // Add all local testing ports

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the origin is in our allowed list OR if the origin is undefined (server-to-server call)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Blocked: Origin not allowed - " + origin));
    }
  },
  credentials: true, // Crucial for passing cookies/sessions
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Apply CORS middleware
// ----------------------------------------------------------------------


// ------------------ MIDDLEWARES ------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());


// ------------------ DATABASE ------------------
connectDB();

// ------------------ ROUTES ------------------
// Base URL structure used is /api/v1/rent/...
app.use("/api/v1/rent/user", userRoutes);
app.use("/api/v1/rent/listing", propertyRouter);
app.use("/api/v1/rent/user/booking", bookingRouter);

// ------------------ ROOT ROUTE ------------------
app.get("/", (req, res) => {
  // Simple check route to confirm server is running
  res.send("✅ HomelyHub backend is live and running on Render!");
});

// ------------------ SERVER START ------------------
app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});