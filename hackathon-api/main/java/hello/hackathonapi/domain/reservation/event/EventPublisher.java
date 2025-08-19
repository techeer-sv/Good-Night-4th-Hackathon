package hello.hackathonapi.domain.reservation.event;

import hello.hackathonapi.domain.seat.entity.SeatStatus;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class EventPublisher {
    
    private final ApplicationEventPublisher eventPublisher;

    public EventPublisher(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void publishEvent(Long seatId, SeatStatus status) {
        ReservationEvent event = new ReservationEvent(seatId, status);
        eventPublisher.publishEvent(event);
    }
}
