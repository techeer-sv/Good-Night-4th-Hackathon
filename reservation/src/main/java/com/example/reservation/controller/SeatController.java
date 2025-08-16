package com.example.reservation.controller;

import com.example.reservation.dto.ReservationRequestDto;
import com.example.reservation.dto.ReservationResponseDto;
import com.example.reservation.dto.SeatResponseDto;
import com.example.reservation.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping
    public ResponseEntity<List<SeatResponseDto>> getAllSeats() {
        List<SeatResponseDto> seats = seatService.getAllSeats();
        return ResponseEntity.ok(seats);
    }

    @PostMapping("/{seatId}/reserve")
    public ResponseEntity<ReservationResponseDto> reserveSeat(@PathVariable Long seatId, @RequestBody ReservationRequestDto requestDto) {
        if (!seatId.equals(requestDto.getSeatId())) {
            return ResponseEntity.badRequest().build();
        }

        ReservationResponseDto response = seatService.reserveSeat(requestDto);
        return ResponseEntity.ok(response);
    }
}