import db from '../config/database.js';
import {
  isValidUUID,
  sendError,
  validateEventData,
  validateRegistrationData,
  validatePaginationParams
} from '../utils/validation.js';

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { title, starts_at, ends_at, location, capacity } = req.body;

    // Comprehensive validation using validation utility
    const validationErrors = validateEventData(req.body);
    if (validationErrors.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', validationErrors.join('; '));
    }

    // Insert event
    const result = await db.query(`
      INSERT INTO events (title, starts_at, ends_at, location, capacity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [title.trim(), starts_at, ends_at || null, location?.trim() || null, capacity]);

    res.status(201).json({
      eventId: result.rows[0].id,
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle specific database constraint violations
    if (error.code === '23514') { // Check constraint violation
      return sendError(res, 400, 'VALIDATION_ERROR', 'Capacity must be between 1 and 1000');
    }
    
    sendError(res, 500, 'DATABASE_ERROR', 'Failed to create event');
  }
};

// Get full event details including registered users
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid event ID format');
    }

    // Get event details with registered users
    const result = await db.query(`
      SELECT 
        e.id,
        e.title,
        e.starts_at,
        e.ends_at,
        e.location,
        e.capacity,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'user_id', u.id,
              'name', u.name,
              'email', u.email
            )
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'::json
        ) as registrations
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE e.id = $1
      GROUP BY e.id, e.title, e.starts_at, e.ends_at, e.location, e.capacity
    `, [id]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Event not found');
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching event:', error);
    sendError(res, 500, 'DATABASE_ERROR', 'Failed to fetch event');
  }
};

// Register a user for an event
export const registerUserForEvent = async (req, res) => {
  const client = await db.connect();
  
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Validate event ID
    if (!isValidUUID(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid event ID format');
    }

    // Validate registration data
    const validationErrors = validateRegistrationData(req.body);
    if (validationErrors.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', validationErrors.join('; '));
    }

    await client.query('BEGIN');

    // ✅ BUSINESS RULE: Check if event exists
    const eventResult = await client.query(`
      SELECT id, title, starts_at, capacity
      FROM events 
      WHERE id = $1 
      FOR UPDATE
    `, [id]);

    if (eventResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 404, 'NOT_FOUND', 'Event not found');
    }

    const event = eventResult.rows[0];

    // ✅ BUSINESS RULE: Disallow registration for past events
    if (new Date(event.starts_at) <= new Date()) {
      await client.query('ROLLBACK');
      return sendError(res, 422, 'BUSINESS_LOGIC_ERROR', 'Cannot register for past events');
    }

    // ✅ BUSINESS RULE: Check if user exists
    const userCheck = await client.query(`
      SELECT id FROM users WHERE id = $1
    `, [userId]);

    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 404, 'NOT_FOUND', 'User not found');
    }

    // ✅ BUSINESS RULE: Prevent double registration
    const existingRegistration = await client.query(`
      SELECT id FROM registrations 
      WHERE user_id = $1 AND event_id = $2
    `, [userId, id]);

    if (existingRegistration.rows.length > 0) {
      await client.query('ROLLBACK');
      return sendError(res, 409, 'CONFLICT', 'User is already registered for this event');
    }

    // ✅ BUSINESS RULE: Enforce registration limits per event
    const registrationCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE event_id = $1
    `, [id]);

    const currentRegistrations = parseInt(registrationCount.rows[0].count);
    if (currentRegistrations >= event.capacity) {
      await client.query('ROLLBACK');
      return sendError(res, 422, 'BUSINESS_LOGIC_ERROR', `Event is at full capacity (${event.capacity}/${event.capacity})`);
    }

    // Create registration
    const registrationResult = await client.query(`
      INSERT INTO registrations (user_id, event_id)
      VALUES ($1, $2)
      RETURNING id, registered_at
    `, [userId, id]);

    await client.query('COMMIT');

    res.status(201).json({
      registrationId: registrationResult.rows[0].id,
      registered_at: registrationResult.rows[0].registered_at,
      message: `Successfully registered for event: ${event.title}`,
      remaining_capacity: event.capacity - currentRegistrations - 1
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error registering user:', error);
    
    // Handle specific database constraint violations
    if (error.code === '23503') { // Foreign key violation
      return sendError(res, 404, 'NOT_FOUND', 'User or event not found');
    }
    if (error.code === '23505') { // Unique constraint violation
      return sendError(res, 409, 'CONFLICT', 'User is already registered for this event');
    }
    
    sendError(res, 500, 'DATABASE_ERROR', 'Failed to register user');
  } finally {
    client.release();
  }
};

// Cancel a user registration
export const cancelUserRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Validate event ID
    if (!isValidUUID(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid event ID format');
    }

    // Validate registration data
    const validationErrors = validateRegistrationData(req.body);
    if (validationErrors.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', validationErrors.join('; '));
    }

    // ✅ BUSINESS RULE: Check if event exists
    const eventCheck = await db.query(`
      SELECT id, title, starts_at FROM events WHERE id = $1
    `, [id]);

    if (eventCheck.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Event not found');
    }

    const event = eventCheck.rows[0];

    // ✅ BUSINESS RULE: Prevent cancellation for past events (optional business rule)
    if (new Date(event.starts_at) <= new Date()) {
      return sendError(res, 422, 'BUSINESS_LOGIC_ERROR', 'Cannot cancel registration for past events');
    }

    // Delete registration
    const result = await db.query(`
      DELETE FROM registrations 
      WHERE user_id = $1 AND event_id = $2
      RETURNING id
    `, [userId, id]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Registration not found');
    }

    res.json({
      message: 'Registration cancelled successfully',
      event_title: event.title
    });

  } catch (error) {
    console.error('Error cancelling registration:', error);
    sendError(res, 500, 'DATABASE_ERROR', 'Failed to cancel registration');
  }
};

// List all future events
export const getUpcomingEvents = async (req, res) => {
  try {
    // ✅ BUSINESS RULE: Validate pagination parameters
    const validationErrors = validatePaginationParams(req.query);
    if (validationErrors.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', validationErrors.join('; '));
    }

    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // ✅ BUSINESS RULE: Only show future events (starts_at > NOW())
    const result = await db.query(`
      SELECT 
        e.id,
        e.title,
        e.starts_at,
        e.location,
        e.capacity,
        COALESCE(COUNT(r.id), 0) as registered_count,
        (e.capacity - COALESCE(COUNT(r.id), 0)) as remaining_capacity,
        CASE 
          WHEN COALESCE(COUNT(r.id), 0) >= e.capacity THEN true 
          ELSE false 
        END as is_full
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.starts_at > NOW()
      GROUP BY e.id, e.title, e.starts_at, e.location, e.capacity
      ORDER BY e.starts_at ASC, e.location ASC NULLS LAST
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count for pagination metadata
    const totalResult = await db.query(`
      SELECT COUNT(*) as total
      FROM events
      WHERE starts_at > NOW()
    `);

    const total = parseInt(totalResult.rows[0].total);
    const hasMore = offset + limit < total;

    res.json({
      events: result.rows,
      pagination: {
        limit,
        offset,
        total,
        hasMore,
        nextOffset: hasMore ? offset + limit : null
      }
    });

  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    sendError(res, 500, 'DATABASE_ERROR', 'Failed to fetch upcoming events');
  }
};

// Return event statistics
export const getEventStats = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid event ID format');
    }

    const result = await db.query(`
      SELECT 
        e.capacity,
        COUNT(r.id) as total_registrations,
        (e.capacity - COUNT(r.id)) as remaining_capacity,
        ROUND((COUNT(r.id)::DECIMAL / e.capacity * 100), 2) as percentage_used
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = $1
      GROUP BY e.id, e.capacity
    `, [id]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Event not found');
    }

    const stats = result.rows[0];
    
    res.json({
      total_registrations: parseInt(stats.total_registrations),
      remaining_capacity: parseInt(stats.remaining_capacity),
      percentage_used: parseFloat(stats.percentage_used)
    });

  } catch (error) {
    console.error('Error fetching event stats:', error);
    sendError(res, 500, 'DATABASE_ERROR', 'Failed to fetch event statistics');
  }
};