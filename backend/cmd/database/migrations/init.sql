-- Database initialization script for Good Night 4th Hackathon
-- Creates tables for seats and reservations

-- Create seats table
CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    seat_id INTEGER NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seats_number ON seats(number);

CREATE INDEX IF NOT EXISTS idx_seats_available ON seats(is_available);

CREATE INDEX IF NOT EXISTS idx_reservations_seat_id ON reservations(seat_id);

CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
