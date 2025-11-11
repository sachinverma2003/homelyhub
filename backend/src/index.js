import express from 'express';
import cors from 'cors'; // a3b is cors
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // a3c is cookie-parser
import connectDB from './utils/db.js'; // a3d is connectDB
import { router as userRoutes } from './routes/userRoutes.js';
import { propertyRouter } from './routes/propertyRouter.js';
import { bookingRouter } from './routes/bookingRouter.js';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// Set the port (0x1f91 in the original code is 8081)
const port = process.env.PORT || 8081;

// --- CRITICAL FIX: CORS MIDDLEWARE ---
// This enables the Render server to accept requests from the Netlify frontend.
app.use(cors({
    // Uses the environment variable set on the Render dashboard
    origin: process.env.CORS_ORIGIN, 
    credentials: true // Important for setting cookies/sessions
}));

// Body Parsers (allowing large files up to 100mb)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Cookie Parser (for JWT)
app.use(cookieParser());

// Database Connection
connectDB(); // Connects to MongoDB Atlas

// --- Route Definitions ---
app.use('/api/v1/rent/user', userRoutes);
app.use('/api/v1/rent/listing', propertyRouter);
app.use('/api/v1/rent/user/booking', bookingRouter);

// Start Server Listener
app.listen(port, () => {
    console.log('App running on port: ' + port);
});