package com.example.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ReservationRequestDto {
    @NotNull
    private Long seatId;

    @NotBlank
    private String userName;

    @NotBlank
    private String phone;

    @NotBlank(message = "sessionId는 필수입니다")
    private String sessionId;
}