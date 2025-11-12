const express = require('express');
const cors = require('cors');
const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    'https://homelyhub-frontend-joyf-pnf.vercel.app',
    'https://homelyhub-frontend-joyf-pnf.taming-sacklrwcmm2003s-projects.vercel.app',
    'http://localhost:3000',
    'https://homelyhub-frontend.vercel.app' // Add any other frontend domains you use
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
const userRoutes = require('./routes/userRoutes');
const propertyRouter = require('./routes/propertyRouter');
const bookingRouter = require('./routes/bookingRouter');

// Use routes
app.use('/v1/rent/user', userRoutes);
app.use('/v1/rent/listing', propertyRouter);
app.use('/v1/rent/booking', bookingRouter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'HomelyHub Backend is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server configuration
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 HomelyHub Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Enabled for frontend domains`);
});

module.exports = app;