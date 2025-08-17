package com.example.reservation.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SessionService {

    // 5개의 고정 세션 ID
    private static final List<String> PREDEFINED_SESSIONS = List.of(
            "s1", "s2", "s3", "s4", "s5"
    );

    private final ConcurrentHashMap<String, SessionInfo> sessions = new ConcurrentHashMap<>();

    public SessionService() {
        long now = System.currentTimeMillis();
        for (String sessionId : PREDEFINED_SESSIONS) {
            sessions.put(sessionId, new SessionInfo(sessionId, now));
        }
        log.info("Predefined sessions initialized: {}", PREDEFINED_SESSIONS);
    }

    // 기존 생성 메서드는 비활성화
    public String createSession() {
        throw new UnsupportedOperationException("고정된 세션만 사용 가능합니다.");
    }

    public boolean isValidSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) return false;
        SessionInfo info = sessions.get(sessionId);
        if (info == null) return false;

        long sessionAge = System.currentTimeMillis() - info.getCreatedAt();
        long maxAge = 30 * 60 * 1000; // 30분

        if (sessionAge > maxAge) {
            sessions.remove(sessionId);
            log.info("Session expired: {}", sessionId);
            return false;
        }
        return true;
    }

    public List<String> getActiveSessions() {
        return new ArrayList<>(sessions.keySet());
    }

    public static class SessionInfo {
        private final String sessionId;
        private final long createdAt;

        public SessionInfo(String sessionId, long createdAt) {
            this.sessionId = sessionId;
            this.createdAt = createdAt;
        }

        public String getSessionId() {
            return sessionId;
        }

        public long getCreatedAt() {
            return createdAt;
        }
    }
}