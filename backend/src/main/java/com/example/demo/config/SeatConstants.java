package com.example.demo.config;

public final class SeatConstants {
    
    public static final int INITIAL_SEAT_COUNT = 9;
    public static final int SELECTION_TIMEOUT_MINUTES = 5;
    public static final long CLEANUP_INTERVAL_MS = 60000L;
    public static final double INTENTIONAL_FAILURE_RATE = 0.01;
    
    private SeatConstants() {
        // Utility class
    }
}