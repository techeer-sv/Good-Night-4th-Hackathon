package com.example.demo.controller;

import com.example.demo.dto.ReservationRequest;
import com.example.demo.entity.Seat;
import com.example.demo.exception.SeatNotFoundException;
import com.example.demo.repository.SeatRepository;
import com.example.demo.service.SeatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SeatController.class)
class SeatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SeatService seatService;

    @MockBean
    private SeatRepository seatRepository; // Add this mock

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void whenGetAllSeats_thenReturnListOfSeats() throws Exception {
        Seat seat1 = new Seat();
        seat1.setId(1L);
        seat1.setSeatNumber(1);
        seat1.setReserved(false);
        
        Seat seat2 = new Seat();
        seat2.setId(2L);
        seat2.setSeatNumber(2);
        seat2.setReserved(true);
        seat2.setReservedBy("Jules");
        
        when(seatService.getAllSeats()).thenReturn(List.of(seat1, seat2));

        mockMvc.perform(get("/api/seats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].seatNumber").value(1))
                .andExpect(jsonPath("$[1].reservedBy").value("Jules"));
    }

    @Test
    void whenReserveSeat_andSuccess_thenReturnOk() throws Exception {
        Seat reservedSeat = new Seat();
        reservedSeat.setId(1L);
        reservedSeat.setSeatNumber(1);
        reservedSeat.setReserved(true);
        reservedSeat.setReservedBy("Jules");
        
        when(seatService.reserveSeatWithSelection(eq(1L), any(String.class), any(String.class))).thenReturn(reservedSeat);

        ReservationRequest request = new ReservationRequest();
        request.setReservedBy("Jules");
        request.setSelectedBy("Jules");

        mockMvc.perform(post("/api/seats/1/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seatNumber").value(1))
                .andExpect(jsonPath("$.isReserved").value(true))
                .andExpect(jsonPath("$.reservedBy").value("Jules"));
    }

    @Test
    void whenReserveSeat_andSeatNotFound_thenReturnNotFound() throws Exception {
        when(seatService.reserveSeatWithSelection(eq(1L), any(String.class), any(String.class))).thenThrow(new SeatNotFoundException("Seat not found"));

        ReservationRequest request = new ReservationRequest();
        request.setReservedBy("Jules");
        request.setSelectedBy("Jules");

        mockMvc.perform(post("/api/seats/1/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void whenReserveSeat_andSeatAlreadyReserved_thenReturnConflict() throws Exception {
        when(seatService.reserveSeatWithSelection(eq(1L), any(String.class), any(String.class))).thenThrow(new IllegalStateException("Seat already reserved"));

        ReservationRequest request = new ReservationRequest();
        request.setReservedBy("Jules");
        request.setSelectedBy("Jules");

        mockMvc.perform(post("/api/seats/1/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }
}