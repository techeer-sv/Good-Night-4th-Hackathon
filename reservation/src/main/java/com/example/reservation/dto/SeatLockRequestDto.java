package com.example.reservation.dto;

import lombok.Getter;

@Getter
public class SeatLockRequestDto {
    private Long seatId;
    private String sessionId;
}