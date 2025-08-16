package com.example.demo.exception;

public class ReservationFailedException extends RuntimeException {
    public ReservationFailedException(String message) {
        super(message);
    }
}