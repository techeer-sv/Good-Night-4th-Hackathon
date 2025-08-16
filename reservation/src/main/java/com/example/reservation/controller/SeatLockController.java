package com.example.reservation.controller;

import com.example.reservation.dto.SeatLockRequestDto;
import com.example.reservation.service.SeatLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatLockController {

    private final SeatLockService seatLockService;

    @PostMapping("/{seatId}/lock")
    public ResponseEntity<?> lockSeat(@PathVariable Long seatId,
                                      @RequestBody SeatLockRequestDto requestDto) {
        boolean locked = seatLockService.lockSeat(seatId, requestDto.getSessionId());

        if (!locked) {
            return ResponseEntity.status(409).body(
                    Map.of("error", "이미 다른 사용자가 좌석을 선택 중입니다.")
            );
        }

        return ResponseEntity.ok(Map.of(
                "message", "좌석이 성공적으로 잠금 처리되었습니다.",
                "seatId", seatId
        ));
    }

    @DeleteMapping("/{seatId}/lock")
    public ResponseEntity<?> unlockSeat(@PathVariable Long seatId,
                                        @RequestBody SeatLockRequestDto requestDto) {
        seatLockService.unlockSeat(seatId, requestDto.getSessionId());
        return ResponseEntity.ok(Map.of(
                "message", "좌석 잠금이 해제되었습니다.",
                "seatId", seatId
        ));
    }

    @GetMapping("/{seatId}/lock")
    public ResponseEntity<?> isLocked(@PathVariable Long seatId) {
        boolean locked = seatLockService.isLocked(seatId);
        return ResponseEntity.ok(Map.of(
                "seatId", seatId,
                "locked", locked
        ));
    }
}