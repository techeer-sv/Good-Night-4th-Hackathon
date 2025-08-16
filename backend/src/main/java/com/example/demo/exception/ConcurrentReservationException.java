package com.example.demo.exception;

public class ConcurrentReservationException extends RuntimeException {
    public ConcurrentReservationException(String message) {
        super(message);
    }
}