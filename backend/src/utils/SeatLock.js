class SeatLock {
  constructor() {
    this.locks = new Map(); // seatId -> { userId, timestamp, expiresAt }
    this.lockTimeout = 30000; // 30초
  }

  // 좌석 락 획득
  acquireLock(seatId, userId) {
    const now = Date.now();
    const existingLock = this.locks.get(seatId);

    // 기존 락이 있고 아직 유효한 경우
    if (existingLock && existingLock.expiresAt > now) {
      // 같은 사용자가 락을 가지고 있는 경우 갱신
      if (existingLock.userId === userId) {
        existingLock.expiresAt = now + this.lockTimeout;
        return true;
      }
      return false; // 다른 사용자가 락을 가지고 있음
    }

    // 락 획득
    this.locks.set(seatId, {
      userId,
      timestamp: now,
      expiresAt: now + this.lockTimeout
    });

    // 자동 락 해제 타이머
    setTimeout(() => {
      this.releaseLock(seatId, userId);
    }, this.lockTimeout);

    return true;
  }

  // 좌석 락 해제
  releaseLock(seatId, userId) {
    const lock = this.locks.get(seatId);
    if (lock && lock.userId === userId) {
      this.locks.delete(seatId);
      return true;
    }
    return false;
  }

  // 락 상태 확인
  isLocked(seatId) {
    const lock = this.locks.get(seatId);
    if (!lock) return false;
    
    if (lock.expiresAt <= Date.now()) {
      this.locks.delete(seatId);
      return false;
    }
    
    return true;
  }

  // 사용자가 락을 가지고 있는지 확인
  hasLock(seatId, userId) {
    const lock = this.locks.get(seatId);
    if (!lock) return false;
    
    if (lock.expiresAt <= Date.now()) {
      this.locks.delete(seatId);
      return false;
    }
    
    return lock.userId === userId;
  }

  // 만료된 락들 정리
  cleanupExpiredLocks() {
    const now = Date.now();
    for (const [seatId, lock] of this.locks.entries()) {
      if (lock.expiresAt <= now) {
        this.locks.delete(seatId);
      }
    }
  }

  // 모든 락 해제 (테스트용)
  clearAllLocks() {
    this.locks.clear();
  }
}

module.exports = SeatLock;
