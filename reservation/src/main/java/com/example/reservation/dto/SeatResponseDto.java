package com.example.reservation.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SeatResponseDto {
    private Long seatId;
    private String seatNumber;
    private boolean isReserved;
}