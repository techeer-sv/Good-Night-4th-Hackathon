package hello.hackathonapi.domain.reservation.event;

import hello.hackathonapi.domain.seat.entity.SeatStatus;
import lombok.Getter;

@Getter
public class ReservationEvent {
    private final Long seatId;
    private final SeatStatus status;

    public ReservationEvent(Long seatId, SeatStatus status) {
        this.seatId = seatId;
        this.status = status;
    }
}
