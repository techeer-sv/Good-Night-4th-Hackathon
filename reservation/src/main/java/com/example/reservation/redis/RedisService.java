package com.example.reservation.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisService {

    private final StringRedisTemplate stringRedisTemplate;

    public void setValue(String key, String value) {
        try {
            stringRedisTemplate.opsForValue().set(key, value);
            log.debug("Set key: {} = {}", key, value);
        } catch (Exception e) {
            log.error("Failed to set key: {} = {}, error: {}", key, value, e.getMessage());
            throw new RedisConnectionFailureException("Failed to set value in Redis", e);
        }
    }

    public void setValueWithTTL(String key, String value, long ttlSeconds) {
        try {
            stringRedisTemplate.opsForValue().set(key, value, Duration.ofSeconds(ttlSeconds));
            log.debug("Set key: {} = {} with TTL: {}s", key, value, ttlSeconds);
        } catch (Exception e) {
            log.error("Failed to set key: {} = {} with TTL: {}s, error: {}", key, value, ttlSeconds, e.getMessage());
            throw new RedisConnectionFailureException("Failed to set value with TTL in Redis", e);
        }
    }

    public String getValue(String key) {
        try {
            String value = stringRedisTemplate.opsForValue().get(key);
            log.debug("Get key: {} = {}", key, value);
            return value;
        } catch (Exception e) {
            log.error("Failed to get key: {}, error: {}", key, e.getMessage());
            throw new RedisConnectionFailureException("Failed to get value from Redis", e);
        }
    }

    public void deleteValue(String key) {
        try {
            Boolean result = stringRedisTemplate.delete(key);
            log.debug("Delete key: {}, result: {}", key, result);
        } catch (Exception e) {
            log.error("Failed to delete key: {}, error: {}", key, e.getMessage());
            throw new RedisConnectionFailureException("Failed to delete value from Redis", e);
        }
    }

    // 🔑 추가된 deleteKey 메서드
    public void deleteKey(String key) {
        deleteValue(key);
    }
}