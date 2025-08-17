package com.example.reservation.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

class SessionServiceTest {

    private SessionService sessionService;

    @BeforeEach
    void setUp() {
        sessionService = new SessionService();
    }

    @Test
    void 세션목록_5개존재() {
        List<String> sessions = sessionService.getActiveSessions();
        assertThat(sessions).containsExactlyInAnyOrder("s1", "s2", "s3", "s4", "s5");
    }

    @Test
    void 유효한_세션인경우_true() {
        boolean valid = sessionService.isValidSession("s1");
        assertThat(valid).isTrue();
    }

    @Test
    void 유효하지않은_세션인경우_false() {
        boolean valid = sessionService.isValidSession("x1");
        assertThat(valid).isFalse();
    }
}