# Event Management API

A comprehensive REST API for managing events and user registrations built with Node.js, Express, and PostgreSQL.

## Features

- User management with UUID-based identification
- Event creation and management
- Event registration system with capacity limits
- Comprehensive validation and error handling
- Transaction-safe operations
- Past event validation
- Duplicate registration prevention

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL (Neon DB)
- **Architecture**: MVC pattern with separated routes and controllers
- **Validation**: Custom validation middleware
- **Environment**: ES Modules

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (we recommend Neon DB for cloud hosting)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd Event_Management_Api/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   PORT=5001
   ```

4. **Database Setup**
   Run the migration to create the required tables:
   ```bash
   # Connect to your PostgreSQL database and run:
   psql -d your_database -f src/migrations/create_tables.sql
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:5001`

### Database Schema

The API uses three main tables:

- **users**: Stores user information with UUID primary keys
- **events**: Stores event details with capacity management
- **registrations**: Links users to events with timestamp tracking

## API Documentation

### Base URL
```
http://localhost:5001/api
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create a new user |
| GET | `/users` | Get all users |
| POST | `/events` | Create a new event |
| GET | `/events` | Get all events |
| POST | `/events/:eventId/register` | Register for an event |
| GET | `/events/:eventId/registrations` | Get event registrations |

---

## API Endpoints

### 1. Create User

**POST** `/api/users`

Creates a new user in the system.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "created_at": "2025-10-16T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### 2. Get All Users

**GET** `/api/users`

Retrieves all users in the system.

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2025-10-16T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "created_at": "2025-10-16T11:15:00.000Z"
    }
  ]
}
```

---

### 3. Create Event

**POST** `/api/events`

Creates a new event.

**Request Body:**
```json
{
  "name": "Tech Conference 2025",
  "description": "Annual technology conference featuring the latest trends",
  "date": "2025-12-15",
  "capacity": 100
}
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Tech Conference 2025",
    "description": "Annual technology conference featuring the latest trends",
    "date": "2025-12-15T00:00:00.000Z",
    "capacity": 100,
    "created_at": "2025-10-16T12:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Event date cannot be in the past"
}
```

---

### 4. Get All Events

**GET** `/api/events`

Retrieves all events with registration counts.

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Tech Conference 2025",
      "description": "Annual technology conference featuring the latest trends",
      "date": "2025-12-15T00:00:00.000Z",
      "capacity": 100,
      "registration_count": "15",
      "created_at": "2025-10-16T12:00:00.000Z"
    }
  ]
}
```

---

### 5. Register for Event

**POST** `/api/events/:eventId/register`

Registers a user for a specific event.

**URL Parameters:**
- `eventId`: UUID of the event

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "event_id": "660e8400-e29b-41d4-a716-446655440001",
    "registered_at": "2025-10-16T14:30:00.000Z"
  }
}
```

**Error Responses:**

**Already Registered (400 Bad Request):**
```json
{
  "success": false,
  "message": "User is already registered for this event"
}
```

**Event Full (400 Bad Request):**
```json
{
  "success": false,
  "message": "Event is already at full capacity"
}
```

**Past Event (400 Bad Request):**
```json
{
  "success": false,
  "message": "Cannot register for past events"
}
```

---

### 6. Get Event Registrations

**GET** `/api/events/:eventId/registrations`

Retrieves all registrations for a specific event.

**URL Parameters:**
- `eventId`: UUID of the event

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "event_id": "660e8400-e29b-41d4-a716-446655440001",
      "registered_at": "2025-10-16T14:30:00.000Z",
      "user_name": "John Doe",
      "user_email": "john.doe@example.com"
    }
  ]
}
```

---

## Validation Rules

### User Validation
- **Name**: Required, 1-100 characters, no leading/trailing spaces
- **Email**: Required, valid email format, unique in system

### Event Validation
- **Name**: Required, 1-200 characters, no leading/trailing spaces
- **Description**: Optional, max 1000 characters
- **Date**: Required, must be in future (YYYY-MM-DD format)
- **Capacity**: Required, positive integer, max 10,000

### Registration Validation
- **User ID**: Required, valid UUID, must exist in users table
- **Event ID**: Required, valid UUID, must exist in events table
- **Business Rules**: 
  - No duplicate registrations
  - Event must not be at capacity
  - Event must not be in the past

## Error Handling

The API uses standard HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors, business rule violations)
- **404**: Not Found
- **500**: Internal Server Error

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Development

### Project Structure
```
Backend/
├── src/
│   ├── config/
│   │   └── database.js         # Database connection
│   ├── controllers/
│   │   └── eventController.js  # Business logic
│   ├── middlewares/
│   │   └── validation.js       # Request validation
│   ├── migrations/
│   │   └── create_tables.sql   # Database schema
│   ├── routes/
│   │   └── eventRoutes.js      # Route definitions
│   ├── utils/
│   │   └── validation.js       # Validation utilities
│   └── index.js                # Application entry point
├── docs/                       # Documentation
├── package.json
└── README.md
```

### Testing

You can test the API using the provided Postman collection or any HTTP client. See the `docs/postman-testing-guide.md` for detailed testing instructions.

### Creating Test Data

Run the test user creation script:
```bash
node src/createTestUsers.js
```

This will create sample users and display their UUIDs for testing purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please create an issue in the repository or contact the development team.