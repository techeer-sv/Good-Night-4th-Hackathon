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
    public ResponseEntity<ReservationResponseDto> reserveSeat(@PathVariable Long seatId,
                                                              @RequestBody ReservationRequestDto requestDto) {
        ReservationResponseDto response = seatService.reserveSeat(seatId, requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/seats/by-phone")
    public ResponseEntity<List<SeatResponseDto>> getSeatsByPhone(@RequestParam String phone) {
        List<SeatResponseDto> seats = seatService.getSeatsByPhone(phone);
        return ResponseEntity.ok(seats);
    }
}