package com.goodnight.ticket_service.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;
import com.goodnight.ticket_service.service.SeatService;

@WebMvcTest(SeatController.class)
public class SeatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SeatService seatService;

    @Test
    void 모든_좌석_목록_조회_테스트() throws Exception {
        // given
        Seat seat1 = new Seat();
        seat1.setId(1L);
        seat1.setSeatCode("A1");
        seat1.setStatus(SeatStatus.AVAILABLE);

        Seat seat2 = new Seat();
        seat2.setId(2L);
        seat2.setSeatCode("A2");
        seat2.setStatus(SeatStatus.RESERVED);

        List<Seat> seats = Arrays.asList(seat1, seat2);
        when(seatService.findAllSeats()).thenReturn(seats);

        // when & then
        mockMvc.perform(get("/api/seats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].seatCode").value("A1"))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].seatCode").value("A2"))
                .andExpect(jsonPath("$[1].status").value("RESERVED"));
    }

    @Test
    void 특정_좌석_조회_테스트() throws Exception {
        // given
        Seat seat = new Seat();
        seat.setId(1L);
        seat.setSeatCode("A1");
        seat.setStatus(SeatStatus.AVAILABLE);

        when(seatService.findSeatById(1L)).thenReturn(seat);

        // when & then
        mockMvc.perform(get("/api/seats/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.seatCode").value("A1"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));
    }

    @Test
    void 존재하지_않는_좌석_조회_테스트() throws Exception {
        // given
        when(seatService.findSeatById(999L)).thenReturn(null);

        // when & then
        mockMvc.perform(get("/api/seats/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void 사용_가능한_좌석만_조회_테스트() throws Exception {
        // given
        Seat seat = new Seat();
        seat.setId(1L);
        seat.setSeatCode("A1");
        seat.setStatus(SeatStatus.AVAILABLE);

        List<Seat> availableSeats = Arrays.asList(seat);
        when(seatService.findAvailableSeats()).thenReturn(availableSeats);

        // when & then
        mockMvc.perform(get("/api/seats/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].seatCode").value("A1"))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"));
    }

    @Test
    void 예약된_좌석만_조회_테스트() throws Exception {
        // given
        Seat seat = new Seat();
        seat.setId(2L);
        seat.setSeatCode("A2");
        seat.setStatus(SeatStatus.RESERVED);

        List<Seat> reservedSeats = Arrays.asList(seat);
        when(seatService.findReservedSeats()).thenReturn(reservedSeats);

        // when & then
        mockMvc.perform(get("/api/seats/reserved"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2))
                .andExpect(jsonPath("$[0].seatCode").value("A2"))
                .andExpect(jsonPath("$[0].status").value("RESERVED"));
    }
}