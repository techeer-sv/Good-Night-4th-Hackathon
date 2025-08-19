package hello.hackathonapi.domain.reservation.repository;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class RedisLockRepository {
    
    private final RedisTemplate<String, String> redisTemplate;
    private static final Duration LOCK_DURATION = Duration.ofSeconds(30); // Lock 유지 시간

    public RedisLockRepository(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Boolean lock(String key) {
        try {
            String lockValue = Thread.currentThread().getName();
            return Boolean.TRUE.equals(redisTemplate
                    .opsForValue()
                    .setIfAbsent(key, lockValue, LOCK_DURATION));
        } catch (Exception e) {
            return false;
        }
    }

    public Boolean unlock(String key) {
        try {
            String lockValue = redisTemplate.opsForValue().get(key);
            String currentThread = Thread.currentThread().getName();
            
            if (lockValue != null && lockValue.equals(currentThread)) {
                return Boolean.TRUE.equals(redisTemplate.delete(key));
            }
            return true; // 다른 스레드의 락이면 이미 해제된 것으로 간주
        } catch (Exception e) {
            return false;
        }
    }
}
