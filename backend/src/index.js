require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logInfo, logError } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  logInfo(`${req.method} request received at ${req.url}`);
  next();
});

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Barangay e-Document System Backend is running successfully.',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// 404 Error Handler Route
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'API Endpoint not found.'
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  logError(`Unhandled Error: ${err.message}`);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  logInfo(`Server is actively running on port ${PORT}`);
});
