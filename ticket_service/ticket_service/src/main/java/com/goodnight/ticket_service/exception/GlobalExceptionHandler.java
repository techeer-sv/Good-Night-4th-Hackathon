package com.goodnight.ticket_service.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.goodnight.ticket_service.dto.ReservationResponseDto;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /*
     * 좌석 이미 예약됨 예외 처리
     */
    @ExceptionHandler(SeatAlreadyReservedException.class)
    public ResponseEntity<ReservationResponseDto> handleSeatAlreadyReservedException(
            SeatAlreadyReservedException ex, WebRequest request) {

        log.warn("좌석 이미 예약됨: {}", ex.getMessage());

        ReservationResponseDto response = ReservationResponseDto.builder()
                .status("FAILED")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    /*
     * 잘못된 인수 예외 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ReservationResponseDto> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        log.warn("잘못된 인수: {}", ex.getMessage());

        ReservationResponseDto response = ReservationResponseDto.builder()
                .status("FAILED")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    /*
     * 유효성 검사 실패 예외 처리
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("status", "FAILED");
        response.put("message", "입력 데이터가 올바르지 않습니다.");
        response.put("errors", errors);
        response.put("timestamp", LocalDateTime.now());

        log.warn("유효성 검사 실패: {}", errors);

        return ResponseEntity.badRequest().body(response);
    }

    /*
     * 런타임 예외 처리
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ReservationResponseDto> handleRuntimeException(
            RuntimeException ex, WebRequest request) {

        log.error("런타임 예외 발생: {}", ex.getMessage(), ex);

        ReservationResponseDto response = ReservationResponseDto.builder()
                .status("FAILED")
                .message("시스템 일시적 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /*
     * 일반적인 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(
            Exception ex, WebRequest request) {

        log.error("예상치 못한 예외 발생: {}", ex.getMessage(), ex);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "FAILED");
        response.put("message", "서버 내부 오류가 발생했습니다. 관리자에게 문의해주세요.");
        response.put("timestamp", LocalDateTime.now());
        response.put("error", ex.getClass().getSimpleName());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}