package com.example.reservation.controller;

import com.example.reservation.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<?> createSession() {
        String sessionId = sessionService.createSession();
        return ResponseEntity.ok(Map.of(
                "sessionId", sessionId,
                "message", "새로운 세션이 생성되었습니다.",
                "createdAt", System.currentTimeMillis()
        ));
    }

    @GetMapping("/list")
    public ResponseEntity<List<String>> getSessions() {
        return ResponseEntity.ok(sessionService.getActiveSessions());
    }
}