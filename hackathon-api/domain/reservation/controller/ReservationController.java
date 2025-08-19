package hello.hackathonapi.domain.reservation.controller;

import hello.hackathonapi.domain.reservation.dto.ReservationResponse;
import hello.hackathonapi.domain.reservation.entity.Reservation;
import hello.hackathonapi.domain.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Reservation", description = "예약 API")
@RestController
@RequestMapping("/api/v1/concerts/{concertId}/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "좌석 예약", description = "공연의 특정 좌석을 예약합니다.")
    @PostMapping("/seats/{seatId}")
    public ResponseEntity<ReservationResponse> createReservation(
            @Parameter(description = "공연 ID", required = true) @PathVariable Long concertId,
            @Parameter(description = "좌석 ID", required = true) @PathVariable Long seatId,
            @Parameter(description = "회원 ID", required = true) @RequestParam Long memberId
    ) {
        Reservation reservation = reservationService.createReservation(concertId, seatId, memberId);
        
        return ResponseEntity.ok(ReservationResponse.from(reservation));
    }

    @Operation(summary = "예약 취소", description = "예약을 취소합니다.")
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<ReservationResponse> cancelReservation(
            @Parameter(description = "공연 ID", required = true) @PathVariable Long concertId,
            @Parameter(description = "예약 ID", required = true) @PathVariable Long reservationId,
            @Parameter(description = "회원 ID", required = true) @RequestParam Long memberId
    ) {
        Reservation canceledReservation = reservationService.cancelReservation(concertId, reservationId, memberId);
        
        return ResponseEntity.ok(ReservationResponse.from(canceledReservation));
    }
}
