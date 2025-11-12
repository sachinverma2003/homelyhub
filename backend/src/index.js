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

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://stellar-jelly-2126bf.netlify.app",
  "https://homelyhub-s6uq.onrender.com"
];

// CORS Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors());
app.set("trust proxy", 1); // Required for cookies on Render

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Connect DB
connectDB();

// Routes
app.use("/v1/rent/user", userRoutes);
app.use("/v1/rent/listing", propertyRouter);
app.use("/v1/rent/user/booking", bookingRouter);

app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
