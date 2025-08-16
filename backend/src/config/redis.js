const Redis = require('ioredis');

// Redis 클라이언트 생성
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

// Redis 연결 상태 모니터링
redis.on('connect', () => {
  console.log('✅ Redis 연결 성공');
});

redis.on('error', (error) => {
  console.error('❌ Redis 연결 오류:', error);
});

redis.on('close', () => {
  console.log('🔌 Redis 연결 종료');
});

// 분산 락 클래스
class DistributedLock {
  constructor(redisClient) {
    this.redis = redisClient;
    this.defaultTTL = 30000; // 30초
  }

  // 락 획득
  async acquireLock(lockKey, userId, ttl = this.defaultTTL) {
    try {
      const result = await this.redis.set(
        lockKey, 
        userId, 
        'PX', // 밀리초 단위 만료
        ttl, 
        'NX'  // 키가 존재하지 않을 때만 설정
      );
      
      if (result === 'OK') {
        console.log(`🔒 락 획득 성공: ${lockKey} (사용자: ${userId})`);
        return true;
      } else {
        console.log(`❌ 락 획득 실패: ${lockKey} (이미 다른 사용자가 사용 중)`);
        return false;
      }
    } catch (error) {
      console.error('❌ 락 획득 중 오류:', error);
      return false;
    }
  }

  // 락 해제
  async releaseLock(lockKey, userId) {
    try {
      // Lua 스크립트로 원자적 락 해제 (소유자만 해제 가능)
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      
      const result = await this.redis.eval(luaScript, 1, lockKey, userId);
      
      if (result === 1) {
        console.log(`🔓 락 해제 성공: ${lockKey} (사용자: ${userId})`);
        return true;
      } else {
        console.log(`❌ 락 해제 실패: ${lockKey} (권한 없음 또는 이미 해제됨)`);
        return false;
      }
    } catch (error) {
      console.error('❌ 락 해제 중 오류:', error);
      return false;
    }
  }

  // 락 상태 확인
  async isLocked(lockKey) {
    try {
      const result = await this.redis.exists(lockKey);
      return result === 1;
    } catch (error) {
      console.error('❌ 락 상태 확인 중 오류:', error);
      return false;
    }
  }

  // 락 소유자 확인
  async getLockOwner(lockKey) {
    try {
      return await this.redis.get(lockKey);
    } catch (error) {
      console.error('❌ 락 소유자 확인 중 오류:', error);
      return null;
    }
  }

  // 락 TTL 확인
  async getLockTTL(lockKey) {
    try {
      return await this.redis.pttl(lockKey);
    } catch (error) {
      console.error('❌ 락 TTL 확인 중 오류:', error);
      return -1;
    }
  }
}

// 분산 락 인스턴스 생성
const distributedLock = new DistributedLock(redis);

// 테스트 연결 함수
const testRedisConnection = async () => {
  try {
    await redis.ping();
    console.log('✅ Redis 연결 테스트 성공');
    return true;
  } catch (error) {
    console.error('❌ Redis 연결 테스트 실패:', error);
    return false;
  }
};

module.exports = {
  redis,
  distributedLock,
  testRedisConnection
};
