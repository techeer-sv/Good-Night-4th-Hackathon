package com.example.reservation.service;

import com.example.reservation.redis.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SeatLockService {

    private final RedisService redisService;

    private static final int LOCK_TTL_SECONDS = 20;

    public boolean lockSeat(Long seatId, String sessionId) {
        String key = "seat:" + seatId;

        String existingSession = redisService.getValue(key);
        if (existingSession != null && !existingSession.equals(sessionId)) {
            return false;
        }

        redisService.setValueWithTTL(key, sessionId, LOCK_TTL_SECONDS);
        return true;
    }

    public void unlockSeat(Long seatId, String sessionId) {
        String key = "seat:" + seatId;
        String existingSession = redisService.getValue(key);

        if (sessionId.equals(existingSession)) {
            redisService.deleteValue(key);
        }
    }

    public boolean isLocked(Long seatId) {
        String key = "seat:" + seatId;
        return redisService.getValue(key) != null;
    }
}