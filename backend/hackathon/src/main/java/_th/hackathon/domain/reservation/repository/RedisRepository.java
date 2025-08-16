package _th.hackathon.domain.reservation.repository;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RedisRepository {
    private final RedisTemplate<String, String> redisTemplate;

    public RedisRepository(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Long increment(Long performanceId, Long seatId) {
        String key = buildKey(performanceId, seatId);
        return redisTemplate.opsForValue().increment(key);
    }

    private String buildKey(Long performanceId, Long seatId) {
        return String.format("resv:%d:%d", performanceId, seatId);
    }

    public void reset(Long performanceId, Long seatId) {
        redisTemplate.delete(buildKey(performanceId, seatId));
    }
}
