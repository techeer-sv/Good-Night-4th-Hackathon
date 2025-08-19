package hello.hackathonapi.domain.seat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import hello.hackathonapi.domain.concert.entity.Concert;
import hello.hackathonapi.domain.seat.entity.Seat;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByConcert(Concert concert);
}
