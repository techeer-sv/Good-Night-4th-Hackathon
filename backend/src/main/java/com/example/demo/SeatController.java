package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping
    public List<Seat> getAllSeats() {
        return seatService.getAllSeats();
    }

    @PostMapping("/{id}/reserve")
    public ResponseEntity<Seat> reserveSeat(@PathVariable Long id, @RequestBody ReservationRequest request) {
        Seat reservedSeat = seatService.reserveSeat(id, request.getReservedBy());
        return ResponseEntity.ok(reservedSeat);
    }
}
