package com.example.reservation.controller;

import com.example.reservation.dto.SeatLockRequestDto;
import com.example.reservation.service.SeatLockService;
import com.example.reservation.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatLockController {

    private final SeatLockService seatLockService;
    private final SessionService sessionService;

    @PostMapping("/{seatId}/lock")
    public ResponseEntity<?> lockSeat(@PathVariable Long seatId,
                                      @Valid @RequestBody SeatLockRequestDto requestDto) {
        String sessionId = requestDto.getSessionId();
        
        // sessionId가 필수
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "sessionId는 필수입니다. /api/sessions 엔드포인트에서 세션을 생성해주세요.")
            );
        }
        
        // 세션 유효성 검증
        if (!sessionService.isValidSession(sessionId)) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "유효하지 않은 세션이거나 만료된 세션입니다.")
            );
        }

        boolean locked = seatLockService.lockSeat(seatId, sessionId);

        if (!locked) {
            return ResponseEntity.status(409).body(
                    Map.of("error", "이미 다른 사용자가 좌석을 선택 중입니다.")
            );
        }

        return ResponseEntity.ok(Map.of(
                "message", "좌석이 성공적으로 잠금 처리되었습니다.",
                "seatId", seatId,
                "sessionId", sessionId,
                "lockedAt", System.currentTimeMillis()
        ));
    }

    @DeleteMapping("/{seatId}/lock")
    public ResponseEntity<?> unlockSeat(@PathVariable Long seatId,
                                        @RequestParam String sessionId) {
        if (!sessionService.isValidSession(sessionId)) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "유효하지 않은 세션입니다.")
            );
        }

        seatLockService.unlockSeat(seatId, sessionId);
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