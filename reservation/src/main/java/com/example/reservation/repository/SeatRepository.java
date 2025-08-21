package com.example.reservation.repository;

import com.example.reservation.domain.Seat;
import com.example.reservation.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByUser(User user);
}