package com.goodnight.ticket_service.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.goodnight.ticket_service.dto.ReservationResponseDto;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * 좌석 이미 예약된 경우 예외 처리
     */
    @ExceptionHandler(SeatAlreadyReservedException.class)
    public ResponseEntity<ReservationResponseDto> handleSeatAlreadyReservedException(SeatAlreadyReservedException e) {
        ReservationResponseDto response = ReservationResponseDto.builder()
                .status("FAILED")
                .message(e.getMessage())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    /*
     * 잘못된 인수 예외 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ReservationResponseDto> handleIllegalArgumentException(IllegalArgumentException e) {
        ReservationResponseDto response = ReservationResponseDto.builder()
                .status("FAILED")
                .message(e.getMessage())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    /*
     * 유효성 검사 실패 예외 처리
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity.badRequest().body(errors);
    }

    /*
     * 기타 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ReservationResponseDto> handleGenericException(Exception e) {
        ReservationResponseDto response = ReservationResponseDto.builder()
                .status("FAILED")
                .message("시스템 오류가 발생했습니다: " + e.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}