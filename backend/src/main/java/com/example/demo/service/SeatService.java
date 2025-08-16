package com.example.demo.service;

import com.example.demo.config.SeatConstants;
import com.example.demo.entity.Seat;
import com.example.demo.exception.ConcurrentReservationException;
import com.example.demo.exception.ReservationFailedException;
import com.example.demo.exception.SeatNotFoundException;
import com.example.demo.repository.SeatRepository;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final AtomicLong lastModified = new AtomicLong(System.currentTimeMillis());

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    private Seat validateSeatForReservation(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new SeatNotFoundException("Seat not found with id: " + seatId));

        if (seat.isReserved()) {
            throw new IllegalStateException("Seat is already reserved");
        }
        return seat;
    }

    @Transactional
    public Seat reserveSeat(Long seatId, String reservedBy) {
        try {
            Seat seat = validateSeatForReservation(seatId);

            // 1% chance of intentional failure
            if (Math.random() < SeatConstants.INTENTIONAL_FAILURE_RATE) {
                throw new ReservationFailedException("Reservation failed intentionally.");
            }

            seat.setReserved(true);
            seat.setReservedBy(reservedBy);
            seat.setReservationTime(LocalDateTime.now());

            Seat result = seatRepository.save(seat);
            lastModified.set(System.currentTimeMillis());
            return result;
        } catch (OptimisticLockingFailureException e) {
            throw new ConcurrentReservationException("Another user reserved this seat. Please try again.");
        }
    }

    public String getSeatStatusHash() {
        List<Seat> seats = getAllSeats();
        StringBuilder sb = new StringBuilder();
        for (Seat seat : seats) {
            sb.append(seat.getId()).append(":")
              .append(seat.isReserved()).append(":")
              .append(seat.getVersion()).append(";");
        }
        
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(sb.toString().getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(sb.toString().hashCode());
        }
    }

    public long getLastModifiedTime() {
        return lastModified.get();
    }

    @Transactional
    public Seat selectSeat(Long seatId, String selectedBy) {
        Seat seat = validateSeatForReservation(seatId);

        // Check if seat is already selected by another user
        if (seat.getSelectedBy() != null && !seat.getSelectedBy().equals(selectedBy)) {
            LocalDateTime selectionTime = seat.getSelectedAt();
            if (selectionTime != null && selectionTime.plusMinutes(SeatConstants.SELECTION_TIMEOUT_MINUTES).isAfter(LocalDateTime.now())) {
                throw new IllegalStateException("Seat is currently selected by another user");
            }
        }

        // Set selection
        seat.setSelectedBy(selectedBy);
        seat.setSelectedAt(LocalDateTime.now());

        Seat result = seatRepository.save(seat);
        lastModified.set(System.currentTimeMillis());
        return result;
    }

    @Transactional
    public Seat cancelSelection(Long seatId, String selectedBy) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new SeatNotFoundException("Seat not found with id: " + seatId));

        // Only allow cancellation if the seat is selected by the requesting user
        if (seat.getSelectedBy() == null || !seat.getSelectedBy().equals(selectedBy)) {
            throw new IllegalStateException("Seat is not selected by this user");
        }

        seat.setSelectedBy(null);
        seat.setSelectedAt(null);

        Seat result = seatRepository.save(seat);
        lastModified.set(System.currentTimeMillis());
        return result;
    }

    @Transactional
    public Seat reserveSeatWithSelection(Long seatId, String reservedBy, String selectedBy) {
        try {
            Seat seat = validateSeatForReservation(seatId);

            // Check if the user has selection priority (within 5 minutes)
            if (seat.getSelectedBy() != null && !seat.getSelectedBy().equals(selectedBy)) {
                LocalDateTime selectionTime = seat.getSelectedAt();
                if (selectionTime != null && selectionTime.plusMinutes(SeatConstants.SELECTION_TIMEOUT_MINUTES).isAfter(LocalDateTime.now())) {
                    throw new IllegalStateException("Another user has selection priority for this seat");
                }
            }

            // 1% chance of intentional failure
            if (Math.random() < SeatConstants.INTENTIONAL_FAILURE_RATE) {
                throw new ReservationFailedException("Reservation failed intentionally.");
            }

            seat.setReserved(true);
            seat.setReservedBy(reservedBy);
            seat.setReservationTime(LocalDateTime.now());
            seat.setSelectedBy(null);
            seat.setSelectedAt(null);

            Seat result = seatRepository.save(seat);
            lastModified.set(System.currentTimeMillis());
            return result;
        } catch (OptimisticLockingFailureException e) {
            throw new ConcurrentReservationException("Another user reserved this seat. Please try again.");
        }
    }

    @Scheduled(fixedRate = SeatConstants.CLEANUP_INTERVAL_MS) // Run every minute
    @Transactional
    public void cleanupExpiredSelections() {
        List<Seat> seats = seatRepository.findAll();
        LocalDateTime timeoutAgo = LocalDateTime.now().minusMinutes(SeatConstants.SELECTION_TIMEOUT_MINUTES);
        
        for (Seat seat : seats) {
            if (seat.getSelectedBy() != null && seat.getSelectedAt() != null && 
                seat.getSelectedAt().isBefore(timeoutAgo)) {
                seat.setSelectedBy(null);
                seat.setSelectedAt(null);
                seatRepository.save(seat);
                lastModified.set(System.currentTimeMillis());
            }
        }
    }

    @Transactional
    public int resetAllSeats() {
        List<Seat> seats = seatRepository.findAll();
        int resetCount = 0;
        
        for (Seat seat : seats) {
            seat.setReserved(false);
            seat.setReservedBy(null);
            seat.setReservationTime(null);
            seat.setSelectedBy(null);
            seat.setSelectedAt(null);
            seatRepository.save(seat);
            resetCount++;
        }
        
        lastModified.set(System.currentTimeMillis());
        return resetCount;
    }
}