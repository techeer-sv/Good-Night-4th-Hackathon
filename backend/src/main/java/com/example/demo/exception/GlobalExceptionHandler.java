package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SeatNotFoundException.class)
    public ResponseEntity<Object> handleSeatNotFoundException(SeatNotFoundException ex, WebRequest request) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Object> handleIllegalStateException(IllegalStateException ex, WebRequest request) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ReservationFailedException.class)
    public ResponseEntity<Object> handleReservationFailedException(ReservationFailedException ex, WebRequest request) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ConcurrentReservationException.class)
    public ResponseEntity<Object> handleConcurrentReservationException(ConcurrentReservationException ex, WebRequest request) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage(), "retryable", true), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
        return new ResponseEntity<>(Map.of("error", "An unexpected error occurred"), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}