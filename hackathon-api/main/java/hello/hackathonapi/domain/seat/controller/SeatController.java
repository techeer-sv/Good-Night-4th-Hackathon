package hello.hackathonapi.domain.seat.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import hello.hackathonapi.domain.reservation.entity.Reservation;
import hello.hackathonapi.domain.reservation.entity.ReservationStatus;
import hello.hackathonapi.domain.reservation.repository.ReservationRepository;

import org.springframework.http.HttpStatus;
import hello.hackathonapi.domain.seat.dto.SeatStatusResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import hello.hackathonapi.domain.seat.dto.SeatCreateRequest;
import hello.hackathonapi.domain.seat.dto.SeatUpdateRequest;
import hello.hackathonapi.domain.seat.entity.Seat;
import hello.hackathonapi.domain.seat.service.SeatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/concerts/{concertId}/seats")
@RequiredArgsConstructor
public class SeatController {
    
    private final SeatService seatService;
    private final ReservationRepository reservationRepository;

    @Operation(summary = "좌석 생성", description = "새로운 좌석을 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "좌석 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청: 좌석 입력값이 올바르지 않음")
    })
    @PostMapping
    public ResponseEntity<Seat> createSeat(@Parameter(description = "콘서트 ID", required = true) @PathVariable Long concertId, @RequestBody SeatCreateRequest request) {
        Seat createdSeat = seatService.createSeat(concertId, request);
        
        return new ResponseEntity<>(createdSeat, HttpStatus.CREATED);
    }

    @Operation(summary = "좌석 전체 조회", description = "모든 좌석을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좌석 전체 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 좌석이 존재하지 않음")
    })
    @GetMapping
    public ResponseEntity<List<SeatStatusResponse>> getAllSeats(@PathVariable Long concertId) {
        List<Seat> seats = seatService.getAllSeats(concertId);
        List<SeatStatusResponse> responses = seats.stream()
            .map(seat -> {
                Optional<Reservation> reservation = reservationRepository.findBySeatIdAndStatus(seat, ReservationStatus.CONFIRMED);
                Long memberId = reservation.map(r -> r.getMemberId().getId()).orElse(null);
                Long reservationId = reservation.map(Reservation::getId).orElse(null);
                return SeatStatusResponse.from(seat, memberId, reservationId);
            })
            .collect(Collectors.toList());
        
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @Operation(summary = "좌석 수정", description = "좌석을 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좌석 수정 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 좌석을 찾을 수 없음")
    })
    @PutMapping("/{seatId}")
    public ResponseEntity<Seat> updateSeat(@PathVariable Long concertId, @PathVariable Long seatId, @RequestBody SeatUpdateRequest request) {
        Seat updatedSeat = seatService.updateSeat(seatId, concertId, request);
        
        return new ResponseEntity<>(updatedSeat, HttpStatus.OK);
    }

    @Operation(summary = "좌석 삭제", description = "좌석을 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좌석 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 좌석을 찾을 수 없음")
    })
    @DeleteMapping("/{seatId}")
    public ResponseEntity<Seat> deleteSeat(@PathVariable Long concertId, @PathVariable Long seatId) {
        Seat deletedSeat = seatService.deleteSeat(seatId);
        
        return new ResponseEntity<>(deletedSeat, HttpStatus.OK);
    }
}
