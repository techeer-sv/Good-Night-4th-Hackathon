package com.example.reservation.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReservationResponseDto {
    private Long reservationId;
    private Long seatId;
    private String userName;
    private boolean success;
}