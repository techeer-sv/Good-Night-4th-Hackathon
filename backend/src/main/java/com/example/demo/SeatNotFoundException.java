package com.example.demo;

public class SeatNotFoundException extends RuntimeException {
    public SeatNotFoundException(String message) {
        super(message);
    }
}
