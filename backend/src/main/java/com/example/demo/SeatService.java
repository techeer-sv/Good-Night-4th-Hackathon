package com.example.demo;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SeatService {

    private final SeatRepository seatRepository;

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    @Transactional
    public Seat reserveSeat(Long seatId, String reservedBy) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new SeatNotFoundException("Seat not found with id: " + seatId));

        if (seat.isReserved()) {
            throw new IllegalStateException("Seat is already reserved");
        }

        // 1% chance of intentional failure
        if (Math.random() < 0.01) {
            throw new ReservationFailedException("Reservation failed intentionally.");
        }

        seat.setReserved(true);
        seat.setReservedBy(reservedBy);
        seat.setReservationTime(LocalDateTime.now());

        return seatRepository.save(seat);
    }
}
