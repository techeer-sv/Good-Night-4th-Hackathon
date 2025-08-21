package com.example.reservation.service;

import com.example.reservation.redis.RedisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class SeatLockServiceTest {

    @Mock
    private RedisService redisService;

    @InjectMocks
    private SeatLockService seatLockService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void 좌석잠금_성공() {
        when(redisService.getValue("seat:1")).thenReturn(null);

        boolean result = seatLockService.lockSeat(1L, "s1");

        assertThat(result).isTrue();
        verify(redisService).setValueWithTTL("seat:1", "s1", 200);
    }

    @Test
    void 좌석잠금_다른세션이면_실패() {
        when(redisService.getValue("seat:1")).thenReturn("다른세션");

        boolean result = seatLockService.lockSeat(1L, "s1");

        assertThat(result).isFalse();
    }

    @Test
    void 좌석잠금해제_같은세션일때_성공() {
        when(redisService.getValue("seat:1")).thenReturn("s1");

        seatLockService.unlockSeat(1L, "s1");

        verify(redisService).deleteValue("seat:1");
    }

    @Test
    void 좌석잠금상태확인() {
        when(redisService.getValue("seat:1")).thenReturn("s1");

        boolean locked = seatLockService.isLocked(1L);

        assertThat(locked).isTrue();
    }
}