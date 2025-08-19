package hello.hackathonapi.domain.seat.entity;

public record SeatStatusChangedEvent(
    Long seatId,
    SeatStatus status
) {
}
