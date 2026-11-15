const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Load environment variables
dotenv.config();

// Fail safely if mandatory security configuration is missing
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing.');
  console.error('👉 Please set JWT_SECRET in your .env file or environment settings.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Configurable CORS Policy (Step 6)
const defaultDevOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

// In non-production, allow local dev origins + envOrigins. In production, only allow configured envOrigins.
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? envOrigins
  : [...new Set([...defaultDevOrigins, ...envOrigins])];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (mobile apps, curl, server-to-server health checks)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: Origin ${origin} is not allowed by CORS policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve uploaded static product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Build Market – Construction Materials Store API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS blocked:')) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  console.error('Unhandled Application Error:', err);
  
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server and verify DB connection
async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Build Market Backend running on: http://localhost:${PORT}`);
    console.log(`📁 Uploads served from: http://localhost:${PORT}/uploads/`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer();
