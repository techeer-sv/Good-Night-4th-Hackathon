package com.example.reservation.controller;

import com.example.reservation.dto.SeatResponseDto;
import com.example.reservation.service.SeatService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SeatController.class)
class SeatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SeatService seatService;

    @Test
    void 좌석조회_정상() throws Exception {
        SeatResponseDto seat = SeatResponseDto.builder()
                .seatId(1L)
                .seatNumber("A1")
                .isReserved(false)
                .userName("홍길동")
                .phone("010-1234-5678")
                .build();

        Mockito.when(seatService.getAllSeats()).thenReturn(List.of(seat));

        mockMvc.perform(get("/api/seats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].seatNumber").value("A1"));
    }
}