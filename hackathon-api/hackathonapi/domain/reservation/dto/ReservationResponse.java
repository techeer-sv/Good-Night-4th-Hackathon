package hello.hackathonapi.domain.reservation.dto;

import hello.hackathonapi.domain.reservation.entity.Reservation;
import hello.hackathonapi.domain.reservation.entity.ReservationStatus;

public record ReservationResponse(
    Long id,
    Long memberId,
    Long seatId,
    String reservationNumber,
    ReservationStatus status
) {
    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(
            reservation.getId(),
            reservation.getMemberId().getId(),
            reservation.getSeatId().getId(),
            reservation.getReservationNumber(),
            reservation.getStatus()
        );
    }
}
