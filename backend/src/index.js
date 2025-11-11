import express from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; 
import connectDB from './utils/db.js'; 
import { router as userRoutes } from './routes/userRoutes.js';
import { propertyRouter } from './routes/propertyRouter.js';
import { bookingRouter } from './routes/bookingRouter.js';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// Set the port (0x1f91 in the original code is 8081)
const port = process.env.PORT || 8081;

// ----------------------------------------------------
// --- FINAL CORS CONFIGURATION (This fixes the error) ---
// ----------------------------------------------------

// Define the origins that are allowed to make requests
const allowedOrigins = [
    // 1. The live Netlify domain from Render env variable (CRITICAL)
    process.env.CORS_ORIGIN, 
    // 2. The local development URL (for your local testing)
    'http://localhost:5173' 
];

const corsOptions = {
    // Function to dynamically check the origin against the allowed list
    origin: function (origin, callback) {
        // Allow if the origin is in our allowed list OR if the origin is undefined (like a direct server call)
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Allows cookies (JWT/sessions) to be passed across domains
};

// --- MIDDLEWARE SETUP (Order is crucial!) ---

// 1. CORS Middleware (MUST be first for security handshake)
app.use(cors(corsOptions)); 

// 2. Body Parsers (allowing large files up to 100mb)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// 3. Cookie Parser (for JWT)
app.use(cookieParser());

// 4. Database Connection
connectDB(); 

// --- Route Definitions ---
app.use('/api/v1/rent/user', userRoutes);
app.use('/api/v1/rent/listing', propertyRouter);
app.use('/api/v1/rent/user/booking', bookingRouter);

// Start Server Listener
app.listen(port, () => {
    console.log(`App running on port: ${port}`);
});