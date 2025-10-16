# Event Management API - Business Logic Implementation

## ✅ Business Logic Rules Implemented

### 🔒 **Registration Limits Per Event**
- **Rule**: Each event has a maximum capacity (1-1000 attendees)
- **Implementation**: 
  - Database constraint: `CHECK (capacity > 0 AND capacity <= 1000)`
  - Application validation in `createEvent` and `registerUserForEvent`
  - Transaction-level locking to prevent race conditions
  - Returns 422 status with clear message when at capacity

### 🚫 **Prevent Double Registration**
- **Rule**: Users cannot register multiple times for the same event
- **Implementation**:
  - Database constraint: `UNIQUE(user_id, event_id)` in registrations table
  - Application-level check before registration
  - Returns 409 Conflict status if already registered

### ⏰ **Disallow Registration for Past Events**
- **Rule**: Users cannot register for events that have already started
- **Implementation**:
  - Check `starts_at > NOW()` in registration logic
  - Also prevents cancellation of past event registrations
  - Returns 422 status with clear error message

### 📝 **Input Data Validation**
- **Rule**: All input data must be properly validated
- **Implementation**:
  - UUID format validation for all ID parameters
  - Email format validation for user emails
  - Date format validation (ISO 8601) for event dates
  - String length limits (title: 3-255 chars, name: 2-100 chars)
  - Required field validation
  - Content-type validation (application/json)

### 🔢 **HTTP Status Codes & Messages**
- **Rule**: Return appropriate HTTP status codes and clear error messages
- **Implementation**:
  - `200` - Successful operations
  - `201` - Successful creation
  - `400` - Validation errors
  - `404` - Resource not found
  - `409` - Conflict (double registration)
  - `422` - Business logic error (capacity full, past event)
  - `500` - Server errors

## 📋 API Endpoints with Business Logic

### 1️⃣ **POST /api/events** - Create Event
**Business Rules Applied:**
- ✅ Title validation (required, 3-255 chars)
- ✅ Date validation (ISO format, future date)
- ✅ Capacity validation (1-1000)
- ✅ End date after start date validation

**Response Codes:**
- `201` - Event created successfully
- `400` - Validation errors
- `500` - Database errors

### 2️⃣ **GET /api/events/:id** - Get Event Details
**Business Rules Applied:**
- ✅ UUID validation for event ID
- ✅ Include registration count and user details

**Response Codes:**
- `200` - Event found
- `400` - Invalid UUID format
- `404` - Event not found
- `500` - Database errors

### 3️⃣ **POST /api/events/:id/register** - Register User
**Business Rules Applied:**
- ✅ UUID validation for event ID and user ID
- ✅ Event exists validation
- ✅ User exists validation
- ✅ Future event validation
- ✅ Prevent double registration
- ✅ Capacity limit enforcement
- ✅ Transaction safety with row locking

**Response Codes:**
- `201` - Registration successful
- `400` - Validation errors
- `404` - Event or user not found
- `409` - Already registered
- `422` - Business logic errors (past event, capacity full)
- `500` - Database errors

### 4️⃣ **DELETE /api/events/:id/register** - Cancel Registration
**Business Rules Applied:**
- ✅ UUID validation
- ✅ Event exists validation
- ✅ Registration exists validation
- ✅ Prevent cancellation of past events

**Response Codes:**
- `200` - Cancellation successful
- `400` - Validation errors
- `404` - Registration not found
- `422` - Cannot cancel past events
- `500` - Database errors

### 5️⃣ **GET /api/events/upcoming** - List Future Events
**Business Rules Applied:**
- ✅ Only show future events (`starts_at > NOW()`)
- ✅ Pagination validation (limit: 1-100, offset: ≥0)
- ✅ Include capacity and registration info
- ✅ Ordered by date and location

**Response Codes:**
- `200` - Events retrieved
- `400` - Invalid pagination parameters
- `500` - Database errors

### 6️⃣ **GET /api/events/:id/stats** - Event Statistics
**Business Rules Applied:**
- ✅ UUID validation
- ✅ Event exists validation
- ✅ Calculate accurate registration statistics

**Response Codes:**
- `200` - Statistics retrieved
- `400` - Invalid UUID
- `404` - Event not found
- `500` - Database errors

## 🛡️ Additional Security & Validation

### Middleware Validation:
- ✅ UUID parameter validation
- ✅ Request body validation
- ✅ Content-type validation
- ✅ Business operation logging

### Database Constraints:
- ✅ Foreign key constraints with CASCADE DELETE
- ✅ Unique constraints to prevent duplicates
- ✅ Check constraints for capacity limits
- ✅ Indexes for performance optimization

### Error Handling:
- ✅ Consistent error response format
- ✅ Database constraint violation handling
- ✅ Transaction rollback on failures
- ✅ Detailed error logging

## 🔄 Transaction Safety

### Registration Process:
1. Begin transaction
2. Lock event row (`FOR UPDATE`)
3. Validate event exists and is future
4. Check user exists
5. Prevent double registration
6. Check capacity limit
7. Create registration
8. Commit transaction

This ensures thread-safe registration even under high load!