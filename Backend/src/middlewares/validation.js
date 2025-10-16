import { isValidUUID, sendError } from '../utils/validation.js';

// Middleware to validate UUID parameters
export const validateUUIDParam = (paramName = 'id') => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    
    if (!uuid || !isValidUUID(uuid)) {
      return sendError(res, 400, 'VALIDATION_ERROR', `Invalid ${paramName} format - must be a valid UUID`);
    }
    
    next();
  };
};

// Middleware to validate request body exists
export const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Request body is required');
  }
  
  next();
};

// Middleware to log business logic operations
export const logBusinessOperation = (operation) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const { id } = req.params;
    const { userId } = req.body || {};
    
    console.log(`[${timestamp}] BUSINESS OPERATION: ${operation}`, {
      eventId: id,
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    next();
  };
};

// Middleware to validate content type for POST/PUT requests
export const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Content-Type must be application/json');
    }
  }
  
  next();
};