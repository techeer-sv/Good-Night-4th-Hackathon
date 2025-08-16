const { Concert, Seat, Booking } = require('../models');
const SeatLock = require('../utils/SeatLock');
const PriorityQueue = require('../utils/PriorityQueue');

class BookingService {
  constructor() {
    this.seatLock = new SeatLock();
    this.priorityQueue = new PriorityQueue();
    
    // 주기적으로 만료된 락 정리
    setInterval(() => {
      this.seatLock.cleanupExpiredLocks();
    }, 10000); // 10초마다
  }

  // 공연 목록 조회
  async getConcerts() {
    try {
      const concerts = await Concert.findAll();
      return {
        success: true,
        data: concerts,
        message: '공연 목록을 성공적으로 조회했습니다.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '공연 목록 조회에 실패했습니다.'
      };
    }
  }

  // 공연 상세 정보 조회
  async getConcertById(concertId) {
    try {
      const concert = await Concert.findByPk(concertId);
      if (!concert) {
        return {
          success: false,
          error: 'NOT_FOUND',
          message: '해당 공연을 찾을 수 없습니다.'
        };
      }

      const seats = await Seat.findAll({
        where: { concertId },
        order: [['row', 'ASC'], ['seatNumber', 'ASC']]
      });

      // 좌석 통계 계산
      const totalSeats = seats.length;
      const availableSeats = seats.filter(seat => seat.status === 'available').length;
      const reservedSeats = seats.filter(seat => seat.status === 'reserved').length;
      const bookedSeats = seats.filter(seat => seat.status === 'booked').length;
      const reservationRate = totalSeats > 0 ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100) : 0;

      const stats = {
        totalSeats,
        availableSeats,
        reservedSeats,
        bookedSeats,
        reservationRate
      };

      return {
        success: true,
        data: {
          ...concert.toJSON(),
          seats,
          stats
        },
        message: '공연 정보를 성공적으로 조회했습니다.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '공연 정보 조회에 실패했습니다.'
      };
    }
  }

  // 좌석 예약
  async reserveSeats(concertId, seatIds, userId) {
    try {
      // 공연 정보 확인
      const concert = await Concert.findByPk(concertId);
      if (!concert) {
        return {
          success: false,
          error: 'CONCERT_NOT_FOUND',
          message: '공연 정보를 찾을 수 없습니다.'
        };
      }

      const reservedSeats = [];
      const failedSeats = [];

      // 각 좌석에 대해 락 획득 시도
      for (const seatId of seatIds) {
        const seat = await Seat.findByPk(seatId);
        
        if (!seat) {
          failedSeats.push({ seatId, reason: '좌석을 찾을 수 없습니다.' });
          continue;
        }

        // 좌석 상태 확인
        if (seat.status === 'available') {
          try {
            // 좌석 상태를 'reserved'로 변경
            await seat.update({
              status: 'reserved',
              reservedBy: userId,
              reservedAt: new Date()
            });
            
            reservedSeats.push(seat);
          } catch (error) {
            failedSeats.push({ seatId, reason: error.message });
          }
        } else {
          failedSeats.push({ seatId, reason: '이미 예약된 좌석입니다.' });
        }
      }

      if (reservedSeats.length === 0) {
        return {
          success: false,
          error: 'NO_SEATS_RESERVED',
          message: '예약할 수 있는 좌석이 없습니다.',
          data: { failedSeats }
        };
      }

      return {
        success: true,
        data: {
          reservedSeats: reservedSeats.map(seat => seat.toJSON()),
          failedSeats
        },
        message: `${reservedSeats.length}개 좌석을 성공적으로 예약했습니다.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '좌석 예약에 실패했습니다.'
      };
    }
  }

  // 좌석 예매 (예약된 좌석을 실제 예매로 전환)
  async bookSeats(concertId, seatIds, userId, paymentMethod) {
    try {
      // 공연 정보 확인
      const concert = await Concert.findByPk(concertId);
      if (!concert) {
        return {
          success: false,
          error: 'CONCERT_NOT_FOUND',
          message: '공연 정보를 찾을 수 없습니다.'
        };
      }

      const bookedSeats = [];
      const failedSeats = [];
      let totalAmount = 0;

      // 각 좌석에 대해 예매 처리
      for (const seatId of seatIds) {
        const seat = await Seat.findByPk(seatId);
        
        if (!seat) {
          failedSeats.push({ seatId, reason: '좌석을 찾을 수 없습니다.' });
          continue;
        }

        // 좌석 상태 확인
        if (seat.status === 'available') {
          try {
            // 좌석 상태를 'booked'로 변경
            await seat.update({
              status: 'booked',
              bookedBy: userId,
              bookedAt: new Date()
            });
            
            bookedSeats.push(seat);
            totalAmount += seat.price;
          } catch (error) {
            failedSeats.push({ seatId, reason: error.message });
          }
        } else {
          failedSeats.push({ seatId, reason: '이미 예매된 좌석입니다.' });
        }
      }

      if (bookedSeats.length === 0) {
        return {
          success: false,
          error: 'NO_SEATS_BOOKED',
          message: '예매할 수 있는 좌석이 없습니다.',
          data: { failedSeats }
        };
      }

      // 예매 정보 생성
      const bookingData = {
        concertId,
        userId,
        seatIds: bookedSeats.map(seat => seat.id),
        totalAmount,
        paymentMethod,
        status: 'confirmed',
        paymentStatus: 'paid'
      };

      const booking = await Booking.create(bookingData);

      return {
        success: true,
        data: {
          booking,
          bookedSeats: bookedSeats.map(seat => seat.toJSON()),
          failedSeats,
          totalAmount
        },
        message: `${bookedSeats.length}개 좌석을 성공적으로 예매했습니다.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '좌석 예매에 실패했습니다.'
      };
    }
  }

  // 우선순위 대기열 등록
  async joinWaitingQueue(concertId, userId, priority = 'normal') {
    try {
      // 공연 정보 확인
      const concert = await Concert.findByPk(concertId);
      if (!concert) {
        return {
          success: false,
          error: 'CONCERT_NOT_FOUND',
          message: '공연 정보를 찾을 수 없습니다.'
        };
      }

      // 이미 대기열에 있는지 확인
      const existingQueueItem = this.priorityQueue.queue.find(
        item => item.item.userId === userId && item.item.concertId === concertId
      );

      if (existingQueueItem) {
        return {
          success: false,
          error: 'ALREADY_IN_QUEUE',
          message: '이미 대기열에 등록되어 있습니다.'
        };
      }

      // 대기열에 추가
      const queueId = this.priorityQueue.enqueue(
        { userId, concertId, timestamp: Date.now() },
        priority
      );

      const status = this.priorityQueue.getStatus();

      return {
        success: true,
        data: {
          queueId,
          position: this.priorityQueue.queue.findIndex(item => item.id === queueId) + 1,
          estimatedWaitTime: status.estimatedWaitTime,
          queueStatus: status
        },
        message: '대기열에 성공적으로 등록되었습니다.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '대기열 등록에 실패했습니다.'
      };
    }
  }

  // 대기열 상태 확인
  async getWaitingQueueStatus(concertId) {
    try {
      const status = this.priorityQueue.getStatus();
      
      return {
        success: true,
        data: status,
        message: '대기열 상태를 성공적으로 조회했습니다.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '대기열 상태 조회에 실패했습니다.'
      };
    }
  }

  // 사용자별 예매 내역 조회
  async getBookingsByUserId(userId) {
    try {
      const bookings = await Booking.findAll({
        where: { userId },
        include: [
          {
            model: Concert,
            as: 'concert',
            attributes: ['title', 'artist', 'date', 'venue']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return {
        success: true,
        data: bookings,
        message: '예매 내역을 성공적으로 조회했습니다.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '예매 내역 조회에 실패했습니다.'
      };
    }
  }

  // 좌석 예약 해제
  async releaseSeats(concertId, seatIds, userId) {
    try {
      const releasedSeats = [];
      const failedSeats = [];

      for (const seatId of seatIds) {
        const seat = await Seat.findByPk(seatId);
        
        if (!seat) {
          failedSeats.push({ seatId, reason: '좌석을 찾을 수 없습니다.' });
          continue;
        }

        // 예약자 본인인지 확인
        if (seat.reservedBy === userId && seat.status === 'reserved') {
          try {
            // 좌석 상태를 'available'로 변경
            await seat.update({
              status: 'available',
              reservedBy: null,
              reservedAt: null
            });
            
            releasedSeats.push(seat);
          } catch (error) {
            failedSeats.push({ seatId, reason: error.message });
          }
        } else {
          failedSeats.push({ seatId, reason: '예약을 해제할 수 있는 권한이 없습니다.' });
        }
      }

      if (releasedSeats.length === 0) {
        return {
          success: false,
          error: 'NO_SEATS_RELEASED',
          message: '해제할 수 있는 좌석이 없습니다.',
          data: { failedSeats }
        };
      }

      return {
        success: true,
        data: {
          releasedSeats: releasedSeats.map(seat => seat.toJSON()),
          failedSeats
        },
        message: `${releasedSeats.length}개 좌석의 예약을 해제했습니다.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '좌석 예약 해제에 실패했습니다.'
      };
    }
  }
}

module.exports = BookingService;
