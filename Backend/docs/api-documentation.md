# Event Management API - Endpoints Documentation

## Base URL
```
http://localhost:5001/api
```

## Event Endpoints

### 1. Create Event
**POST** `/api/events`

Creates a new event with validation.

**Request Body:**
```json
{
  "title": "Tech Conference 2025",
  "date_time": "2025-11-15T09:00:00",
  "location": "Convention Center, New York",
  "capacity": 500
}
```

**Validation Rules:**
- `title`: Required, string
- `date_time`: Required, ISO format (YYYY-MM-DDTHH:MM:SS)
- `location`: Required, string
- `capacity`: Required, positive integer, max 1000
- Event date must be in the future

**Success Response (201):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Tech Conference 2025",
    "date_time": "2025-11-15T09:00:00.000Z",
    "location": "Convention Center, New York",
    "capacity": 500,
    "created_at": "2025-10-15T10:30:00.000Z"
  }
}
```

### 2. Register for Event
**POST** `/api/events/:id/register`

Register a user for an event with business logic constraints.

**URL Parameters:**
- `id`: Event UUID

**Request Body:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Business Constraints:**
- ✅ **No duplicate registrations** - One user per event
- ✅ **Cannot register if event is full** - Capacity checking
- ✅ **Cannot register for past events** - Date validation

**Success Response (201):**
```json
{
  "success": true,
  "message": "Successfully registered for event",
  "registration": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "registered_at": "2025-10-15T12:00:00.000Z"
  },
  "event_details": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Tech Conference 2025",
    "date_time": "2025-11-15T09:00:00.000Z",
    "capacity": 500,
    "current_registrations": 1,
    "available_spots": 499
  },
  "user_details": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
```json
// Duplicate registration (400)
{
  "error": "User is already registered for this event"
}

// Event is full (400)
{
  "error": "Event is full. Cannot register more attendees.",
  "event_capacity": 500,
  "current_registrations": 500
}

// Past event (400)
{
  "error": "Cannot register for past events"
}
```

### 3. Get Event Details
**POST** `/api/events`

Creates a new event with validation.

**Request Body:**
```json
{
  "title": "Tech Conference 2025",
  "date_time": "2025-11-15T09:00:00",
  "location": "Convention Center, New York",
  "capacity": 500
}
```

**Validation Rules:**
- `title`: Required, string
- `date_time`: Required, ISO format (YYYY-MM-DDTHH:MM:SS)
- `location`: Required, string
- `capacity`: Required, positive integer, max 1000
- Event date must be in the future

**Success Response (201):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Tech Conference 2025",
    "date_time": "2025-11-15T09:00:00.000Z",
    "location": "Convention Center, New York",
    "capacity": 500,
    "created_at": "2025-10-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Capacity must be a positive number and not exceed 1000"
}
```

### 2. Get Event Details
**GET** `/api/events/:id`

Retrieves event details including all registered users.

**URL Parameters:**
- `id`: Event UUID

**Success Response (200):**
```json
{
  "success": true,
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Tech Conference 2025",
    "date_time": "2025-11-15T09:00:00.000Z",
    "location": "Convention Center, New York",
    "capacity": 500,
    "current_registrations": 2,
    "available_spots": 498,
    "created_at": "2025-10-15T10:30:00.000Z",
    "updated_at": "2025-10-15T10:30:00.000Z"
  },
  "registered_users": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "registered_at": "2025-10-15T11:00:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "registered_at": "2025-10-15T11:15:00.000Z"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Event not found"
}
```

### 3. Get All Events (Bonus)
**GET** `/api/events`

Retrieves all events with registration counts.

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tech Conference 2025",
      "date_time": "2025-11-15T09:00:00.000Z",
      "location": "Convention Center, New York",
      "capacity": 500,
      "current_registrations": 2,
      "available_spots": 498,
      "created_at": "2025-10-15T10:30:00.000Z"
    }
  ]
}
```

## User Endpoints

### 1. Create User
**POST** `/api/users`

Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-10-15T10:30:00.000Z"
  }
}
```

### 2. Get All Users
**GET** `/api/users`

Get all users in the system.

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-10-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Get User's Events
**GET** `/api/users/:id/events`

Get all events a user is registered for.

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "registered_events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tech Conference 2025",
      "date_time": "2025-11-15T09:00:00.000Z",
      "location": "Convention Center, New York",
      "capacity": 500,
      "registered_at": "2025-10-15T12:00:00.000Z"
    }
  ],
  "total_events": 1
}
```

## Testing with curl

### Create User:
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### Register for Event:
```bash
curl -X POST http://localhost:5001/api/events/{event-id}/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "{user-id}"
  }'
```

### Create Event:
```bash
curl -X POST http://localhost:5001/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Test Event",
    "date_time": "2025-12-01T14:00:00",
    "location": "Test Location",
    "capacity": 100
  }'
```

### Get Event Details:
```bash
curl http://localhost:5001/api/events/{event-id}
```

### Get All Events:
```bash
curl http://localhost:5001/api/events
```

## Error Codes
- `400`: Bad Request (validation errors)
- `404`: Not Found (event doesn't exist)
- `500`: Internal Server Error