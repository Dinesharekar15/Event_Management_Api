-- Event Management API - Database Migration
-- File: create_tables.sql
-- Description: Creates the core tables for the Event Management system

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
-- Stores user information with UUID primary key
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

-- Add comment explaining users table constraints
COMMENT ON TABLE users IS 'Stores user information for event registration system';
COMMENT ON COLUMN users.id IS 'Unique identifier for each user (UUID)';
COMMENT ON COLUMN users.name IS 'Full name of the user (required)';
COMMENT ON COLUMN users.email IS 'Email address - must be unique across all users';

-- Create events table
-- Stores event information with capacity constraints and timestamps
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    location TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments explaining events table constraints
COMMENT ON TABLE events IS 'Stores event information with capacity limits and scheduling';
COMMENT ON COLUMN events.id IS 'Unique identifier for each event (UUID)';
COMMENT ON COLUMN events.title IS 'Event title/name (required)';
COMMENT ON COLUMN events.starts_at IS 'Event start time with timezone (required)';
COMMENT ON COLUMN events.ends_at IS 'Event end time with timezone (optional)';
COMMENT ON COLUMN events.location IS 'Event location/venue (optional)';
COMMENT ON COLUMN events.capacity IS 'Maximum number of attendees (1-1000)';
COMMENT ON COLUMN events.created_at IS 'Timestamp when event was created';
COMMENT ON CONSTRAINT events_capacity_check ON events IS 'Ensures capacity is between 1 and 1000 attendees';

-- Create registrations table
-- Manages many-to-many relationship between users and events
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent duplicate registrations for the same user-event combination
    CONSTRAINT unique_user_event_registration UNIQUE (user_id, event_id)
);

-- Add comments explaining registrations table constraints
COMMENT ON TABLE registrations IS 'Manages user registrations for events (many-to-many relationship)';
COMMENT ON COLUMN registrations.id IS 'Unique identifier for each registration (UUID)';
COMMENT ON COLUMN registrations.user_id IS 'Reference to users table - cascades on delete';
COMMENT ON COLUMN registrations.event_id IS 'Reference to events table - cascades on delete';
COMMENT ON COLUMN registrations.registered_at IS 'Timestamp when user registered for event';
COMMENT ON CONSTRAINT unique_user_event_registration ON registrations IS 'Prevents users from registering multiple times for the same event';

-- Create indexes for query performance
-- Index on events start time for chronological queries
CREATE INDEX idx_events_starts_at ON events(starts_at);

-- Index on events title with text pattern operations for search functionality
CREATE INDEX idx_events_title_pattern ON events USING btree (title text_pattern_ops);

-- Index on registrations event_id for faster event-based queries
CREATE INDEX idx_registrations_event_id ON registrations(event_id);

-- Index on registrations user_id for faster user-based queries
CREATE INDEX idx_registrations_user_id ON registrations(user_id);

-- Add comments explaining index purposes
COMMENT ON INDEX idx_events_starts_at IS 'Optimizes queries filtering/ordering by event start time';
COMMENT ON INDEX idx_events_title_pattern IS 'Optimizes LIKE/ILIKE pattern matching queries on event titles';
COMMENT ON INDEX idx_registrations_event_id IS 'Optimizes queries finding all users registered for an event';
COMMENT ON INDEX idx_registrations_user_id IS 'Optimizes queries finding all events a user is registered for';