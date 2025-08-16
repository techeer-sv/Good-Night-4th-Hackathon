package _th.hackathon.domain.reservation.repository;

import _th.hackathon.domain.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    long countByPerformanceSeatId(Long performanceSeatId);
    @Query("""
        select r
        from Reservation r
        join fetch r.performanceSeat ps
        join fetch ps.performance p
        join fetch p.show s
        where r.user.id = :userId
        order by r.createdAt desc
    """)
    List<Reservation> findAllByUserIdWithDetails(@Param("userId") Long userId);
}
