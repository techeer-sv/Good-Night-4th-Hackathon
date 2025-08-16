package com.goodnight.ticket_service.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class SeatRepository {
    private final EntityManager em;

    public void save(Seat seat) {
        em.merge(seat);
    }

    public Seat findById(Long id) {
        return em.find(Seat.class, id);
    }

    public List<Seat> findAll() {
        return em.createQuery("SELECT s FROM Seat s", Seat.class).getResultList();
    }

    /*
     * 상태별 좌석 조회
     */
    public List<Seat> findByStatus(SeatStatus status) {
        return em.createQuery("SELECT s FROM Seat s WHERE s.status = :status", Seat.class)
                .setParameter("status", status)
                .getResultList();
    }

    /*
     * 좌석 코드로 좌석 조회
     */
    public Seat findBySeatCode(String seatCode) {
        try {
            return em.createQuery("SELECT s FROM Seat s WHERE s.seatCode = :seatCode", Seat.class)
                    .setParameter("seatCode", seatCode)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }
}
