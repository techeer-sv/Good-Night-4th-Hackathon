package com.example.demo;

public class ReservationFailedException extends RuntimeException {
    public ReservationFailedException(String message) {
        super(message);
    }
}
