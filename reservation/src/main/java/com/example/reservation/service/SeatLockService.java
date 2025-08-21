package com.example.reservation.service;

import com.example.reservation.redis.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatLockService {

    private final RedisService redisService;

    private static final int LOCK_TTL_SECONDS = 200;

    public boolean lockSeat(Long seatId, String sessionId) {
        try {
            String key = "seat:" + seatId;

            String existingSession = redisService.getValue(key);
            if (existingSession != null && !existingSession.equals(sessionId)) {
                return false;
            }

            redisService.setValueWithTTL(key, sessionId, LOCK_TTL_SECONDS);
            log.info("Seat {} locked by session {}", seatId, sessionId);
            return true;
        } catch (Exception e) {
            log.error("Failed to lock seat {} for session {}: {}", seatId, sessionId, e.getMessage());
            return false;
        }
    }

    public void unlockSeat(Long seatId, String sessionId) {
        try {
            String key = "seat:" + seatId;
            String existingSession = redisService.getValue(key);

            if (sessionId.equals(existingSession)) {
                redisService.deleteValue(key);
                log.info("Seat {} unlocked by session {}", seatId, sessionId);
            }
        } catch (Exception e) {
            log.error("Failed to unlock seat {} for session {}: {}", seatId, sessionId, e.getMessage());
        }
    }

    public boolean isLocked(Long seatId) {
        try {
            String key = "seat:" + seatId;
            return redisService.getValue(key) != null;
        } catch (Exception e) {
            log.error("Failed to check lock status for seat {}: {}", seatId, e.getMessage());
            return false;
        }
    }
}