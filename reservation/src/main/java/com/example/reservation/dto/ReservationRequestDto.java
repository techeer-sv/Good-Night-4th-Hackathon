package com.example.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ReservationRequestDto {
    @NotBlank
    private String userName;

    @NotBlank
    private String phone;

    @NotBlank(message = "sessionId는 필수입니다")
    private String sessionId;
}