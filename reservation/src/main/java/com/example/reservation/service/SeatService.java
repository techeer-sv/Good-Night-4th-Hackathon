package com.example.reservation.service;

import com.example.reservation.domain.Reservation;
import com.example.reservation.domain.Seat;
import com.example.reservation.domain.User;
import com.example.reservation.domain.vo.PhoneNumber;
import com.example.reservation.dto.ReservationRequestDto;
import com.example.reservation.dto.ReservationResponseDto;
import com.example.reservation.dto.SeatResponseDto;
import com.example.reservation.repository.ReservationRepository;
import com.example.reservation.repository.SeatRepository;
import com.example.reservation.repository.UserRepository;
import com.example.reservation.redis.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final ReservationRepository reservationRepository;
    private final RedisService redisService;
    private final UserRepository userRepository;

    private static final Random random = new Random();

    @Transactional(readOnly = true)
    public List<SeatResponseDto> getAllSeats() {
        return seatRepository.findAll().stream()
                .map(seat -> SeatResponseDto.builder()
                        .seatId(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .isReserved(seat.isReserved())
                        .userName(seat.getUser() != null ? seat.getUser().getUserName() : null)
                        .phone(seat.getUser() != null ? seat.getUser().getPhone().getValue() : null)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponseDto reserveSeat(Long seatId, ReservationRequestDto requestDto) {
        String sessionId = requestDto.getSessionId();

        String lockedBy = redisService.getValue("seat:" + seatId);
        if (lockedBy == null || !lockedBy.equals(sessionId)) {
            throw new IllegalStateException("현재 이 좌석에 대한 예약 권한이 없습니다.");
        }

        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new IllegalArgumentException("좌석을 찾을 수 없습니다."));

        if (seat.isReserved()) {
            throw new IllegalStateException("이미 예약된 좌석입니다.");
        }

        boolean isSuccess = random.nextInt(100) >= 1;

        if (isSuccess) {
            PhoneNumber phoneNumber = new PhoneNumber(requestDto.getPhone());

            User user = userRepository.findByPhone(phoneNumber)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .userName(requestDto.getUserName())
                                .phone(phoneNumber)
                                .build();
                        return userRepository.save(newUser);
                    });

            seat.setReserved(true);
            seat.setUser(user);
            seat.setLockedBy(sessionId);
            seatRepository.save(seat);
            redisService.deleteKey("seat:" + seatId);
        }

        Reservation reservation = Reservation.builder()
                .seat(seat)
                .userName(requestDto.getUserName())
                .phone(requestDto.getPhone())
                .success(isSuccess)
                .build();

        reservationRepository.save(reservation);

        return ReservationResponseDto.builder()
                .reservationId(reservation.getId())
                .seatId(seat.getId())
                .userName(reservation.getUserName())
                .success(isSuccess)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SeatResponseDto> getSeatsByPhone(String phone) {
        PhoneNumber phoneNumber = new PhoneNumber(phone);

        User user = userRepository.findByPhone(phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("해당 번호의 사용자가 없습니다."));

        List<Seat> seats = seatRepository.findByUser(user);

        return seats.stream()
                .map(seat -> SeatResponseDto.builder()
                        .seatId(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .isReserved(seat.isReserved())
                        .userName(user.getUserName())
                        .phone(user.getPhone().getValue())
                        .build())
                .collect(Collectors.toList());
    }
}