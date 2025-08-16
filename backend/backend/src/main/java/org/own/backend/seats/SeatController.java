package org.own.backend.seats;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.concurrent.ThreadLocalRandom;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "http://localhost:5273")
@RequiredArgsConstructor
public class SeatController {
    private final SeatRepository seatRepository;

    @GetMapping
    public List<Seat> list() {
        return seatRepository.findAllByOrderBySeatIdAsc();
    }

    @PostMapping("/{id}/reserve")
    public ResponseEntity<?> reserve(@PathVariable Integer id, @Valid @RequestBody SeatReservationRequest body) {
        return seatRepository.findById(id)
                .map(seat -> {
                    if (seat.getStatus() == SeatStatus.UNAVAILABLE) {
                        return ResponseEntity.badRequest().body("이미 예약된 좌석입니다.");
                    }
                    // 1% 의도적 실패 처리
                    double random = ThreadLocalRandom.current().nextDouble();
                    if (random < 0.01) {
                        return ResponseEntity.status(503).body("일시적 오류로 예약에 실패했습니다. 잠시 후 다시 시도해주세요.");
                    }
                    seat.setStatus(SeatStatus.UNAVAILABLE);
                    seat.setReserverName(body.name());
                    seat.setReserverPhone(body.phone());
                    seatRepository.save(seat);
                    return ResponseEntity.ok(seat);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}