package hello.hackathonapi.domain.seat.service;

import org.springframework.stereotype.Service;

import hello.hackathonapi.domain.concert.entity.Concert;
import hello.hackathonapi.domain.concert.repository.ConcertRepository;
import hello.hackathonapi.domain.seat.dto.SeatCreateRequest;
import hello.hackathonapi.domain.seat.dto.SeatUpdateRequest;
import hello.hackathonapi.domain.seat.entity.Seat;
import hello.hackathonapi.domain.seat.repository.SeatRepository;
import hello.hackathonapi.global.error.ErrorResponse;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.parameters.RequestBody;

import java.util.ArrayList;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class SeatService {
    
    private final SeatRepository seatRepository;
    private final ConcertRepository concertRepository;

    // 좌석 생성
    @Transactional
    public Seat createSeat(Long concertId, @RequestBody SeatCreateRequest request) {
        
        List<ErrorResponse.FieldError> errors = new ArrayList<>();

        
        if (!errors.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_SEAT_INPUT, errors);
        }

        Concert concert = concertRepository.findById(concertId)
            .orElseThrow(() -> new BusinessException(ErrorCode.CONCERT_NOT_FOUND));

        Seat seat = Seat.builder()
            .concert(concert)
            .number(request.getNumber())
            .grade(request.getGrade())
            .price(request.getPrice())
            .status(request.getStatus())
            .build();

        return seatRepository.save(seat);
    }

    // 좌석 수정
    @Transactional
    public Seat updateSeat(Long id, Long concertId, SeatUpdateRequest request) {
        Seat seat = seatRepository.findById(id)
        .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));

        seat.update(request);
        return seat;
    }

    // 좌석 전체 조회
    public List<Seat> getAllSeats(Long concertId) {
        Concert concert = concertRepository.findById(concertId)
            .orElseThrow(() -> new BusinessException(ErrorCode.CONCERT_NOT_FOUND));

        List<Seat> seats = seatRepository.findByConcert(concert);

        if (seats.isEmpty()) {
            throw new BusinessException(ErrorCode.SEAT_LIST_EMPTY);
        }

        return seats;
    }

    // 좌석 삭제
    @Transactional
    public Seat deleteSeat(Long id) {
        Seat seat = seatRepository.findById(id)
        .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));

        seatRepository.delete(seat);
        return seat;
    }
}
