package com.example.demo.controller;

import com.example.demo.dto.ReservationRequest;
import com.example.demo.dto.SelectionRequest;
import com.example.demo.entity.Seat;
import com.example.demo.service.SeatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSeatStatus() {
        String hash = seatService.getSeatStatusHash();
        long lastModified = seatService.getLastModifiedTime();
        return ResponseEntity.ok(Map.of(
            "hash", hash,
            "lastModified", lastModified
        ));
    }

    @PostMapping("/{id}/select")
    public ResponseEntity<Seat> selectSeat(@PathVariable Long id, @RequestBody SelectionRequest request) {
        Seat selectedSeat = seatService.selectSeat(id, request.getSelectedBy());
        return ResponseEntity.ok(selectedSeat);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Seat> cancelSelection(@PathVariable Long id, @RequestBody SelectionRequest request) {
        Seat cancelledSeat = seatService.cancelSelection(id, request.getSelectedBy());
        return ResponseEntity.ok(cancelledSeat);
    }

    @PostMapping("/{id}/reserve")
    public ResponseEntity<Seat> reserveSeat(@PathVariable Long id, @RequestBody ReservationRequest request) {
        String selectedBy = request.getSelectedBy(); // We'll use the same name for selectedBy
        Seat reservedSeat = seatService.reserveSeatWithSelection(id, request.getReservedBy(), selectedBy);
        return ResponseEntity.ok(reservedSeat);
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetAllSeats() {
        try {
            int resetCount = seatService.resetAllSeats();
            return ResponseEntity.ok(Map.of(
                "message", "All seats have been reset to available state",
                "resetCount", resetCount,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            System.err.println("Error resetting seats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to reset seats: " + e.getMessage()
            ));
        }
    }
}