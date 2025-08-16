package com.example.demo.exception;

public class SeatNotFoundException extends RuntimeException {
    public SeatNotFoundException(String message) {
        super(message);
    }
}