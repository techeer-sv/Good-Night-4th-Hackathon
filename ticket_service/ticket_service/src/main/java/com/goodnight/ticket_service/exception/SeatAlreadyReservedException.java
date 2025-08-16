package com.goodnight.ticket_service.exception;

public class SeatAlreadyReservedException extends RuntimeException {
    public SeatAlreadyReservedException() {
        super();
    }

    public SeatAlreadyReservedException(String message) {
        super(message);
    }

    public SeatAlreadyReservedException(String message, Throwable cause) {
        super(message, cause);
    }

    public SeatAlreadyReservedException(Throwable cause) {
        super(cause);
    }
}