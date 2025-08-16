package com.example.reservation.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SeatResponseDto {
    private Long seatId;
    private String seatNumber;
    private boolean isReserved;
    private String userName;
    private String phone;
}