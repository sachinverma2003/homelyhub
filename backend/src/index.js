// src/index.js
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

// -------------------- Trust proxy --------------------
// Needed on platforms like Render/Railway so secure cookies and forwarded headers work
app.set("trust proxy", 1);

// -------------------- CORS config --------------------
// Provide CORS_ORIGIN as comma-separated list in your environment (Railway)
const rawOrigins = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawOrigins
  ? rawOrigins.split(",").map((s) => s.trim()).filter(Boolean)
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ];

// Optional: always include your backend domain (so tools/server-to-server can work)
if (process.env.BACKEND_PUBLIC_URL) {
  allowedOrigins.push(process.env.BACKEND_PUBLIC_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser requests (Postman, server-to-server) when origin is undefined
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS Blocked: Origin not allowed - " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight for all routes

// -------------------- Middleware --------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// -------------------- Database --------------------
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message || err);
  });

// -------------------- Routes --------------------
// NOTE: your frontend may call /v1/... or /api/v1/..., so we mount both to avoid 404s.
// If you prefer only one, remove the duplicate route.
app.use(["/v1/rent/user", "/api/v1/rent/user"], userRoutes);
app.use(["/v1/rent/listing", "/api/v1/rent/listing"], propertyRouter);
app.use(["/v1/rent/user/booking", "/api/v1/rent/user/booking"], bookingRouter);

// Root check route
app.get("/", (req, res) => {
  res.send("✅ HomelyHub backend is live and running!");
});

// 404 fallback
app.all("*", (req, res) => {
  res.status(404).json({ status: "fail", message: "Route not found" });
});

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error("Global Error:", err && err.message ? err.message : err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Something went wrong",
  });
});

// -------------------- Start server --------------------
app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
  console.log("Allowed CORS origins:", allowedOrigins);
});
