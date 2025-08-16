package com.example.reservation.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SessionService {
    
    // 실제 운영환경에서는 Redis나 데이터베이스를 사용해야 함
    private final ConcurrentHashMap<String, SessionInfo> sessions = new ConcurrentHashMap<>();
    
    public String createSession() {
        String sessionId = UUID.randomUUID().toString();
        SessionInfo sessionInfo = new SessionInfo(sessionId, System.currentTimeMillis());
        sessions.put(sessionId, sessionInfo);
        log.info("New session created: {}", sessionId);
        return sessionId;
    }
    
    public boolean isValidSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return false;
        }
        
        SessionInfo sessionInfo = sessions.get(sessionId);
        if (sessionInfo == null) {
            return false;
        }
        
        // 세션 만료 시간 체크 (30분)
        long currentTime = System.currentTimeMillis();
        long sessionAge = currentTime - sessionInfo.getCreatedAt();
        long maxAge = 30 * 60 * 1000; // 30분
        
        if (sessionAge > maxAge) {
            sessions.remove(sessionId);
            log.info("Session expired: {}", sessionId);
            return false;
        }
        
        return true;
    }
    
    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
        log.info("Session removed: {}", sessionId);
    }
    
    public List<String> getActiveSessions() {
        // 만료된 세션들을 정리
        long currentTime = System.currentTimeMillis();
        long maxAge = 30 * 60 * 1000; // 30분
        
        sessions.entrySet().removeIf(entry -> {
            long sessionAge = currentTime - entry.getValue().getCreatedAt();
            if (sessionAge > maxAge) {
                log.info("Session expired and removed: {}", entry.getKey());
                return true;
            }
            return false;
        });
        
        return sessions.keySet().stream().collect(Collectors.toList());
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