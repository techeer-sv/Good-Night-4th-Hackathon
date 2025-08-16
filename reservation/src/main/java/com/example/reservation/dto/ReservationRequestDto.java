package com.example.reservation.dto;

import lombok.Getter;

@Getter
public class ReservationRequestDto {
    private Long seatId;
    private String userName;
    private String phone;
    private String sessionId;
}