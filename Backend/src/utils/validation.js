// Validation utility functions

// Helper function to validate UUID
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Helper function for consistent error responses
export const sendError = (res, statusCode, code, message) => {
  res.status(statusCode).json({
    error: {
      code,
      message
    }
  });
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate date is in the future
export const isFutureDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date > new Date();
};

// Validate date format (ISO string)
export const isValidISODate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
};

// Event validation rules
export const validateEventData = (eventData) => {
  const errors = [];
  const { title, starts_at, ends_at, location, capacity } = eventData;

  // Title validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Title is required and must be a non-empty string');
  } else if (title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  } else if (title.trim().length > 255) {
    errors.push('Title must not exceed 255 characters');
  }

  // Start date validation
  if (!starts_at) {
    errors.push('starts_at is required');
  } else if (!isValidISODate(starts_at)) {
    errors.push('starts_at must be a valid ISO datetime');
  } else if (!isFutureDate(starts_at)) {
    errors.push('starts_at must be in the future');
  }

  // End date validation (optional)
  if (ends_at) {
    if (!isValidISODate(ends_at)) {
      errors.push('ends_at must be a valid ISO datetime');
    } else if (starts_at && new Date(ends_at) <= new Date(starts_at)) {
      errors.push('ends_at must be after starts_at');
    }
  }

  // Location validation (optional but if provided, must be valid)
  if (location !== null && location !== undefined) {
    if (typeof location !== 'string') {
      errors.push('Location must be a string');
    } else if (location.trim().length > 255) {
      errors.push('Location must not exceed 255 characters');
    }
  }

  // Capacity validation
  if (!capacity) {
    errors.push('Capacity is required');
  } else if (!Number.isInteger(capacity)) {
    errors.push('Capacity must be an integer');
  } else if (capacity <= 0) {
    errors.push('Capacity must be greater than 0');
  } else if (capacity > 1000) {
    errors.push('Capacity must not exceed 1000');
  }

  return errors;
};

// User validation rules
export const validateUserData = (userData) => {
  const errors = [];
  const { name, email } = userData;

  // Name validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required and must be a non-empty string');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters');
  }

  // Email validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(email.trim())) {
    errors.push('Email must be a valid email address');
  } else if (email.trim().length > 255) {
    errors.push('Email must not exceed 255 characters');
  }

  return errors;
};

// Registration validation rules
export const validateRegistrationData = (registrationData) => {
  const errors = [];
  const { userId } = registrationData;

  // User ID validation
  if (!userId) {
    errors.push('userId is required');
  } else if (!isValidUUID(userId)) {
    errors.push('userId must be a valid UUID');
  }

  return errors;
};

// Pagination validation
export const validatePaginationParams = (query) => {
  const errors = [];
  const { limit, offset } = query;

  // Limit validation
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be a number between 1 and 100');
    }
  }

  // Offset validation
  if (offset !== undefined) {
    const offsetNum = parseInt(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      errors.push('Offset must be a non-negative number');
    }
  }

  return errors;
};