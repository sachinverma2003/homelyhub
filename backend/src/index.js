import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './utils/db.js';

import { router as userRoutes } from './routes/userRoutes.js';
import { propertyRouter } from './routes/propertyRouter.js';
import { bookingRouter } from './routes/bookingRouter.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;

// -------------------- CORS FIX --------------------
const allowedOrigins = [
  "https://stellar-jelly-2126bf.netlify.app", // <-- Replace with your Netlify URL
  "http://localhost:5173"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors()); // <-- Handles Preflight

// --------------------------------------------------

// Body Parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Cookie Parser
app.use(cookieParser());

// Connect DB
connectDB();

// -------------------- FIX ROUTES --------------------
// The frontend calls `/v1/rent/...`, not `/api/v1/...`
// So remove `/api` prefix to match the frontend EXACTLY

app.use("/v1/rent/user", userRoutes);
app.use("/v1/rent/listing", propertyRouter);
app.use("/v1/rent/user/booking", bookingRouter);

// ----------------------------------------------------

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
