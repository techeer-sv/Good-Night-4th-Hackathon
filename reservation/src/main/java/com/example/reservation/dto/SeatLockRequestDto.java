package com.example.reservation.dto;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class SeatLockRequestDto {
    @NotNull(message = "seatId는 필수입니다")
    private Long seatId;
    
    @NotBlank(message = "sessionId는 필수입니다")
    private String sessionId; // /api/sessions 엔드포인트에서 생성된 sessionId
}