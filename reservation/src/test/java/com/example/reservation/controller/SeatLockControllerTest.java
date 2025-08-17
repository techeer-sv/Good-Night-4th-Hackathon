package com.example.reservation.controller;

import com.example.reservation.dto.SeatLockRequestDto;
import com.example.reservation.service.SeatLockService;
import com.example.reservation.service.SessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SeatLockController.class)
class SeatLockControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SeatLockService seatLockService;

    @MockBean
    private SessionService sessionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("좌석 잠금 - 성공")
    void lockSeat_success() throws Exception {

        Long seatId = 1L;
        String sessionId = "SESSION123";

        SeatLockRequestDto request = new SeatLockRequestDto();
        request.setSeatId(seatId);
        request.setSessionId(sessionId);

        when(sessionService.isValidSession(sessionId)).thenReturn(true);
        when(seatLockService.lockSeat(seatId, sessionId)).thenReturn(true);

        mockMvc.perform(post("/api/seats/{seatId}/lock", seatId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seatId").value(seatId))
                .andExpect(jsonPath("$.sessionId").value(sessionId))
                .andExpect(jsonPath("$.message").value("좌석이 성공적으로 잠금 처리되었습니다."));
    }

    @Test
    @DisplayName("좌석 잠금 - 세션 누락")
    void lockSeat_missingSession() throws Exception {

        Long seatId = 1L;
        SeatLockRequestDto request = new SeatLockRequestDto();
        request.setSeatId(seatId);
        request.setSessionId("");

        mockMvc.perform(post("/api/seats/{seatId}/lock", seatId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("sessionId는 필수입니다. /api/sessions 엔드포인트에서 세션을 생성해주세요."));
    }

    @Test
    @DisplayName("좌석 잠금 해제 - 성공")
    void unlockSeat_success() throws Exception {
        Long seatId = 2L;
        String sessionId = "SESSION456";

        when(sessionService.isValidSession(sessionId)).thenReturn(true);

        mockMvc.perform(delete("/api/seats/{seatId}/lock", seatId)
                        .param("sessionId", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seatId").value(seatId))
                .andExpect(jsonPath("$.message").value("좌석 잠금이 해제되었습니다."));
    }

    @Test
    @DisplayName("좌석 잠금 상태 확인")
    void isLocked() throws Exception {
        Long seatId = 3L;

        when(seatLockService.isLocked(seatId)).thenReturn(true);

        mockMvc.perform(get("/api/seats/{seatId}/lock", seatId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seatId").value(seatId))
                .andExpect(jsonPath("$.locked").value(true));
    }
}