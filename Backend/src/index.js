import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database.js';
import eventRoutes from './routes/eventRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Basic middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use('/api/events', eventRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API base route
app.get('/api/v1', (req, res) => {
  res.json({
    status: 'success',
    message: 'Event Management API v1',
    version: '1.0.0',
    endpoints: {
      'POST /api/events': 'Create new event',
      'GET /api/events/:id': 'Get event details',
      'POST /api/events/:id/register': 'Register for event',
      'DELETE /api/events/:id/register': 'Cancel registration',
      'GET /api/events/upcoming': 'List upcoming events',
      'GET /api/events/:id/stats': 'Get event statistics'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
