package hello.hackathonapi.domain.reservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import hello.hackathonapi.domain.reservation.entity.Reservation;
import hello.hackathonapi.domain.reservation.entity.ReservationStatus;
import hello.hackathonapi.domain.seat.entity.Seat;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findBySeatIdAndStatus(Seat seat, ReservationStatus status);
}
