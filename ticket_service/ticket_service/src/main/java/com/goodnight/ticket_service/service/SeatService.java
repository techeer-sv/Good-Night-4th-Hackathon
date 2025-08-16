package com.goodnight.ticket_service.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;
import com.goodnight.ticket_service.exception.SeatAlreadyReservedException;
import com.goodnight.ticket_service.repository.SeatRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SeatService {
    private final SeatRepository seatRepository;

    /*
     * 좌석 저장
     */
    @Transactional
    public void saveSeat(Seat seat) {
        seatRepository.save(seat);
    }

    /*
     * 좌석 예약
     */
    @Transactional
    public void reserveSeat(Long seatId) {
        Seat seat = seatRepository.findById(seatId);
        if (seat == null) {
            throw new IllegalArgumentException("존재하지 않는 좌석입니다.");
        }

        if (seat.isReserved()) {
            throw new SeatAlreadyReservedException("이미 예약된 좌석입니다.");
        }

        seat.changeStatus(SeatStatus.RESERVED);
        seatRepository.save(seat);
    }

    /*
     * 좌석 예약 해제
     */
    @Transactional
    public void cancelSeatReservation(Long seatId) {
        Seat seat = seatRepository.findById(seatId);
        if (seat == null) {
            throw new IllegalArgumentException("존재하지 않는 좌석입니다.");
        }

        if (!seat.isReserved()) {
            throw new IllegalArgumentException("예약되지 않은 좌석입니다.");
        }

        seat.changeStatus(SeatStatus.AVAILABLE);
        seatRepository.save(seat);
    }

    /*
     * 좌석 ID로 좌석 조회
     */
    public Seat findSeatById(Long id) {
        return seatRepository.findById(id);
    }

    /*
     * 모든 좌석 조회
     */
    public List<Seat> findAllSeats() {
        return seatRepository.findAll();
    }

    /*
     * 사용 가능한 좌석만 조회
     */
    public List<Seat> findAvailableSeats() {
        return seatRepository.findByStatus(SeatStatus.AVAILABLE);
    }

    /*
     * 예약된 좌석만 조회
     */
    public List<Seat> findReservedSeats() {
        return seatRepository.findByStatus(SeatStatus.RESERVED);
    }
}
