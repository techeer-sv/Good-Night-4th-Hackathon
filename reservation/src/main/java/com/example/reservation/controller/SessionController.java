package com.example.reservation.controller;

import com.example.reservation.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping("/list")
    public ResponseEntity<List<String>> getSessions() {
        return ResponseEntity.ok(sessionService.getActiveSessions());
    }
}