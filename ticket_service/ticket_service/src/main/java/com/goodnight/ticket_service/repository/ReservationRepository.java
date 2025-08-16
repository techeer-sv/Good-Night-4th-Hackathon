package com.goodnight.ticket_service.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.goodnight.ticket_service.domain.Reservation;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ReservationRepository {
    private final EntityManager em;

    public void save(Reservation reservation) {
        em.persist(reservation);
    }

    public Reservation findById(Long id) {
        return em.find(Reservation.class, id);
    }

    public List<Reservation> findAll() {
        return em.createQuery("SELECT r FROM Reservation r", Reservation.class).getResultList();
    }

    public List<Reservation> findByMemberId(Long memberId) {
        return em.createQuery("SELECT r FROM Reservation r WHERE r.member.id = :memberId", Reservation.class)
                .setParameter("memberId", memberId)
                .getResultList();
    }
}