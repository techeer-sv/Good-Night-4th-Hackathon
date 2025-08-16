const { distributedLock } = require('../config/redis');
const { Seat, Booking } = require('../models');
const { sequelize } = require('../models');

class ConcurrencyService {
  constructor() {
    this.lockTimeout = 30000; // 30초
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1초
  }

  // 좌석 락 키 생성
  generateSeatLockKey(seatId) {
    return `seat_lock:${seatId}`;
  }

  // 공연 락 키 생성
  generateConcertLockKey(concertId) {
    return `concert_lock:${concertId}`;
  }

  // 대기열 키 생성
  generateQueueKey(concertId) {
    return `queue:${concertId}`;
  }

  // 분산 락을 사용한 좌석 예매
  async bookSeatsWithDistributedLock(concertId, seatIds, userId, paymentMethod) {
    const locks = [];
    const transaction = await sequelize.transaction();

    try {
      console.log(`🔒 분산 락을 사용한 좌석 예매 시작: ${seatIds.length}개 좌석`);

      // 1단계: 모든 좌석에 대해 분산 락 획득
      for (const seatId of seatIds) {
        const lockKey = this.generateSeatLockKey(seatId);
        const lockAcquired = await distributedLock.acquireLock(lockKey, userId, this.lockTimeout);
        
        if (!lockAcquired) {
          // 락 획득 실패 시 이미 획득한 락들 해제
          await this.releaseAllLocks(locks, userId);
          await transaction.rollback();
          
          return {
            success: false,
            error: 'SEAT_LOCK_FAILED',
            message: `좌석 ${seatId}에 대한 락 획득에 실패했습니다. 다른 사용자가 예약 중입니다.`
          };
        }
        
        locks.push(lockKey);
        console.log(`🔒 좌석 ${seatId} 락 획득 성공`);
      }

      // 2단계: 트랜잭션 내에서 좌석 상태 확인 및 업데이트
      const seats = await Seat.findAll({
        where: { 
          id: seatIds, 
          concertId,
          status: 'available'
        },
        transaction
      });

      if (seats.length !== seatIds.length) {
        await this.releaseAllLocks(locks, userId);
        await transaction.rollback();
        
        return {
          success: false,
          error: 'SEATS_NOT_AVAILABLE',
          message: '일부 좌석이 이미 예매되었거나 존재하지 않습니다.'
        };
      }

      // 3단계: 낙관적 락을 사용한 좌석 업데이트
      const updatePromises = seatIds.map(async (seatId) => {
        const seat = seats.find(s => s.id === seatId);
        if (!seat) return null;

        const result = await Seat.update(
          {
            status: 'booked',
            bookedBy: userId,
            bookedAt: new Date(),
            version: seat.version + 1
          },
          {
            where: { 
              id: seatId, 
              version: seat.version // 버전이 일치해야만 업데이트
            },
            transaction
          }
        );

        if (result[0] === 0) {
          throw new Error(`좌석 ${seatId}의 버전이 변경되었습니다. 다시 시도해주세요.`);
        }

        return seat;
      });

      const updatedSeats = await Promise.all(updatePromises);
      const validSeats = updatedSeats.filter(seat => seat !== null);

      if (validSeats.length === 0) {
        await this.releaseAllLocks(locks, userId);
        await transaction.rollback();
        
        return {
          success: false,
          error: 'OPTIMISTIC_LOCK_FAILED',
          message: '좌석 상태가 변경되었습니다. 다시 시도해주세요.'
        };
      }

      // 4단계: 예매 정보 생성
      const totalAmount = validSeats.reduce((sum, seat) => sum + seat.price, 0);
      
      const booking = await Booking.create({
        concertId,
        userId,
        seatIds: validSeats.map(seat => seat.id),
        totalAmount,
        paymentMethod,
        status: 'confirmed',
        paymentStatus: 'paid'
      }, { transaction });

      // 5단계: 트랜잭션 커밋
      await transaction.commit();

      // 6단계: 모든 락 해제
      await this.releaseAllLocks(locks, userId);

      console.log(`✅ 분산 락을 사용한 좌석 예매 완료: ${validSeats.length}개 좌석`);

      return {
        success: true,
        data: {
          booking,
          bookedSeats: validSeats.map(seat => seat.toJSON()),
          totalAmount
        },
        message: `${validSeats.length}개 좌석을 성공적으로 예매했습니다.`
      };

    } catch (error) {
      console.error('❌ 분산 락을 사용한 좌석 예매 실패:', error);
      
      // 모든 락 해제
      await this.releaseAllLocks(locks, userId);
      
      // 트랜잭션 롤백
      if (transaction) {
        await transaction.rollback();
      }

      return {
        success: false,
        error: 'BOOKING_FAILED',
        message: error.message || '좌석 예매에 실패했습니다.'
      };
    }
  }

  // 모든 락 해제
  async releaseAllLocks(locks, userId) {
    const releasePromises = locks.map(lockKey => 
      distributedLock.releaseLock(lockKey, userId)
    );
    
    await Promise.all(releasePromises);
    console.log(`🔓 모든 락 해제 완료: ${locks.length}개`);
  }

  // 대기열 시스템
  async joinWaitingQueue(concertId, userId, priority = 'normal') {
    try {
      const queueKey = this.generateQueueKey(concertId);
      const queueItem = {
        userId,
        priority,
        timestamp: Date.now(),
        status: 'waiting'
      };

      // 우선순위에 따른 대기열 추가
      if (priority === 'vip') {
        await distributedLock.redis.zadd(queueKey, Date.now() - 1000000, JSON.stringify(queueItem));
      } else if (priority === 'premium') {
        await distributedLock.redis.zadd(queueKey, Date.now() - 100000, JSON.stringify(queueItem));
      } else {
        await distributedLock.redis.zadd(queueKey, Date.now(), JSON.stringify(queueItem));
      }

      console.log(`📋 대기열 등록 완료: 공연 ${concertId}, 사용자 ${userId}, 우선순위 ${priority}`);
      
      return {
        success: true,
        message: '대기열에 등록되었습니다.',
        data: { queuePosition: await this.getQueuePosition(concertId, userId) }
      };
    } catch (error) {
      console.error('❌ 대기열 등록 실패:', error);
      return {
        success: false,
        error: 'QUEUE_JOIN_FAILED',
        message: '대기열 등록에 실패했습니다.'
      };
    }
  }

  // 대기열 위치 확인
  async getQueuePosition(concertId, userId) {
    try {
      const queueKey = this.generateQueueKey(concertId);
      const position = await distributedLock.redis.zrank(queueKey, JSON.stringify({ userId }));
      return position !== null ? position + 1 : null;
    } catch (error) {
      console.error('❌ 대기열 위치 확인 실패:', error);
      return null;
    }
  }

  // 대기열에서 다음 사용자 가져오기
  async getNextFromQueue(concertId) {
    try {
      const queueKey = this.generateQueueKey(concertId);
      const nextItem = await distributedLock.redis.zpopmin(queueKey);
      
      if (nextItem && nextItem.length > 0) {
        const queueData = JSON.parse(nextItem[0]);
        console.log(`📋 대기열에서 다음 사용자: ${queueData.userId}`);
        return queueData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ 대기열에서 다음 사용자 가져오기 실패:', error);
      return null;
    }
  }

  // 좌석 상태 실시간 모니터링
  async monitorSeatStatus(seatId) {
    try {
      const lockKey = this.generateSeatLockKey(seatId);
      const isLocked = await distributedLock.isLocked(lockKey);
      
      if (isLocked) {
        const owner = await distributedLock.getLockOwner(lockKey);
        const ttl = await distributedLock.getLockTTL(lockKey);
        
        return {
          isLocked: true,
          owner,
          ttl,
          message: `좌석 ${seatId}는 ${owner}에 의해 잠겨있습니다. (${Math.ceil(ttl/1000)}초 남음)`
        };
      }
      
      return {
        isLocked: false,
        message: `좌석 ${seatId}는 사용 가능합니다.`
      };
    } catch (error) {
      console.error('❌ 좌석 상태 모니터링 실패:', error);
      return {
        isLocked: false,
        error: error.message
      };
    }
  }
}

module.exports = ConcurrencyService;
