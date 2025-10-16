import express from 'express';
import {
  createEvent,
  getEventById,
  registerUserForEvent,
  cancelUserRegistration,
  getUpcomingEvents,
  getEventStats
} from '../controllers/eventController.js';
import {
  validateUUIDParam,
  validateRequestBody,
  logBusinessOperation,
  validateContentType
} from '../middlewares/validation.js';

const 
router = express.Router();

// Apply content type validation for all routes
router.use(validateContentType);

// 1️⃣ POST /api/events - Create a new event
router.post('/', 
  validateRequestBody,
  logBusinessOperation('CREATE_EVENT'),
  createEvent
);

// 5️⃣ GET /api/events/upcoming - List all future events (must come before /:id route)
router.get('/upcoming', 
  logBusinessOperation('GET_UPCOMING_EVENTS'),
  getUpcomingEvents
);

// 2️⃣ GET /api/events/:id - Get full event details including registered users
router.get('/:id', 
  validateUUIDParam('id'),
  logBusinessOperation('GET_EVENT_DETAILS'),
  getEventById
);

// 3️⃣ POST /api/events/:id/register - Register a user for an event
router.post('/:id/register', 
  validateUUIDParam('id'),
  validateRequestBody,
  logBusinessOperation('REGISTER_USER'),
  registerUserForEvent
);

// 4️⃣ DELETE /api/events/:id/register - Cancel a user registration
router.delete('/:id/register', 
  validateUUIDParam('id'),
  validateRequestBody,
  logBusinessOperation('CANCEL_REGISTRATION'),
  cancelUserRegistration
);

// 6️⃣ GET /api/events/:id/stats - Return event statistics
router.get('/:id/stats', 
  validateUUIDParam('id'),
  logBusinessOperation('GET_EVENT_STATS'),
  getEventStats
);

export default router;