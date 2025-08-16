// src/main/java/_th/hackathon/domain/reservation/dto/UserReservationRes.java
package _th.hackathon.domain.reservation.dto;

import java.time.LocalDateTime;

public record UserReservationRes(
        Long reservationId,
        String status,
        LocalDateTime reservedAt,
        Long performanceSeatId,
        Integer seatNo,
        Long performanceId,
        LocalDateTime startsAt,
        Long showId,
        String showTitle,
        String reserverName,
        String reserverPhone
) {}
