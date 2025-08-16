const express = require('express');
const router = express.Router();
const ConcurrencyService = require('../services/ConcurrencyService');

const concurrencyService = new ConcurrencyService();

// 분산 락을 사용한 좌석 예매
router.post('/book-seats', async (req, res) => {
  try {
    console.log('🔍 /book-seats 요청 받음:', req.body);
    const { concertId, seatIds, userId, paymentMethod } = req.body;

    if (!concertId || !seatIds || !userId || !paymentMethod) {
      console.log('❌ 필수 파라미터 누락:', { concertId, seatIds, userId, paymentMethod });
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: '필수 파라미터가 누락되었습니다.'
      });
    }

    const result = await concurrencyService.bookSeatsWithDistributedLock(
      concertId,
      seatIds,
      userId,
      paymentMethod
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ 동시성 제어 좌석 예매 오류:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

// 대기열 등록
router.post('/join-queue', async (req, res) => {
  try {
    const { concertId, userId, priority = 'normal' } = req.body;

    if (!concertId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: '필수 파라미터가 누락되었습니다.'
      });
    }

    const result = await concurrencyService.joinWaitingQueue(concertId, userId, priority);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ 대기열 등록 오류:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

// 대기열 위치 확인
router.get('/queue-position/:concertId/:userId', async (req, res) => {
  try {
    const { concertId, userId } = req.params;
    const position = await concurrencyService.getQueuePosition(concertId, userId);
    
    res.json({
      success: true,
      data: { position },
      message: position ? `대기열 ${position}번째 위치입니다.` : '대기열에 등록되지 않았습니다.'
    });
  } catch (error) {
    console.error('❌ 대기열 위치 확인 오류:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

// 대기열에서 다음 사용자 가져오기
router.get('/next-in-queue/:concertId', async (req, res) => {
  try {
    const { concertId } = req.params;
    const nextUser = await concurrencyService.getNextFromQueue(concertId);
    
    if (nextUser) {
      res.json({
        success: true,
        data: { nextUser },
        message: '대기열에서 다음 사용자를 가져왔습니다.'
      });
    } else {
      res.json({
        success: true,
        data: { nextUser: null },
        message: '대기열이 비어있습니다.'
      });
    }
  } catch (error) {
    console.error('❌ 대기열 다음 사용자 가져오기 오류:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

// 좌석 상태 실시간 모니터링
router.get('/seat-status/:seatId', async (req, res) => {
  try {
    const { seatId } = req.params;
    const status = await concurrencyService.monitorSeatStatus(seatId);
    
    res.json({
      success: true,
      data: status,
      message: status.message
    });
  } catch (error) {
    console.error('❌ 좌석 상태 모니터링 오류:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

// 락 상태 확인
router.get('/lock-status/:seatId', async (req, res) => {
  try {
    const { seatId } = req.params;
    const { distributedLock } = require('../config/redis');
    
    const lockKey = `seat_lock:${seatId}`;
    const isLocked = await distributedLock.isLocked(lockKey);
    
    if (isLocked) {
      const owner = await distributedLock.getLockOwner(lockKey);
      const ttl = await distributedLock.getLockTTL(lockKey);
      
      res.json({
        success: true,
        data: {
          isLocked: true,
          owner,
          ttl,
          remainingTime: Math.ceil(ttl / 1000)
        },
        message: `좌석 ${seatId}는 ${owner}에 의해 잠겨있습니다.`
      });
    } else {
      res.json({
        success: true,
        data: {
          isLocked: false,
          owner: null,
          ttl: null,
          remainingTime: 0
        },
        message: `좌석 ${seatId}는 사용 가능합니다.`
      });
    }
  } catch (error) {
    console.error('❌ 락 상태 확인 오류:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

// 실시간 좌석 상태 동기화 (Server-Sent Events)
router.get('/seat-sync/:concertId', (req, res) => {
  const { concertId } = req.params;
  
  // SSE 헤더 설정
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  console.log(`🔗 SSE 연결 시작: 공연 ${concertId}`);

  // 클라이언트에게 연결 확인 메시지 전송
  res.write(`data: ${JSON.stringify({
    type: 'connection',
    message: '실시간 좌석 상태 동기화 연결됨',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // 연결 상태 확인을 위한 ping 메시지 (30초마다)
  const pingInterval = setInterval(() => {
    if (!res.destroyed) {
      res.write(`data: ${JSON.stringify({
        type: 'ping',
        message: '연결 상태 확인',
        timestamp: new Date().toISOString()
      })}\n\n`);
    }
  }, 30000);

  // 주기적으로 좌석 상태 업데이트 전송 (30초마다 - 실시간성 향상)
  const updateInterval = setInterval(async () => {
    try {
      // 연결이 끊어진 경우 중단
      if (res.destroyed) {
        clearInterval(updateInterval);
        clearInterval(pingInterval);
        return;
      }

      // 현재 좌석 상태 조회
      const { Seat } = require('../models');
      const seats = await Seat.findAll({
        where: { concertId },
        attributes: ['id', 'status', 'bookedBy', 'updatedAt']
      });

      // 좌석 상태 변경사항 전송
      res.write(`data: ${JSON.stringify({
        type: 'seat_update',
        concertId,
        seats: seats.map(seat => ({
          id: seat.id,
          status: seat.status,
          bookedBy: seat.bookedBy,
          updatedAt: seat.updatedAt
        })),
        timestamp: new Date().toISOString()
      })}\n\n`);

      console.log(`🔄 SSE 좌석 상태 업데이트 전송: ${seats.length}개 좌석`);

    } catch (error) {
      console.error('❌ SSE 좌석 상태 업데이트 오류:', error);
      
      if (!res.destroyed) {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: '좌석 상태 업데이트 실패',
          error: error.message,
          timestamp: new Date().toISOString()
        })}\n\n`);
      }
    }
  }, 30000); // 30초로 감소하여 실시간성 향상

  // 클라이언트 연결 해제 시 정리
  req.on('close', () => {
    console.log(`🔌 SSE 연결 종료: 공연 ${concertId}`);
    clearInterval(updateInterval);
    clearInterval(pingInterval);
  });

  // 에러 처리
  req.on('error', (error) => {
    console.error('❌ SSE 연결 오류:', error);
    clearInterval(updateInterval);
    clearInterval(pingInterval);
  });

  // 응답 객체 소멸 시 정리
  res.on('close', () => {
    console.log(`🔌 SSE 응답 종료: 공연 ${concertId}`);
    clearInterval(updateInterval);
    clearInterval(pingInterval);
  });

  // 연결 유지를 위한 keep-alive (15초마다 - 더 안정적인 연결 유지)
  const keepAliveInterval = setInterval(() => {
    if (!res.destroyed) {
      res.write(`: keep-alive\n\n`);
    }
  }, 15000);

  // keep-alive 정리
  req.on('close', () => {
    clearInterval(keepAliveInterval);
  });
});

// 특정 좌석의 실시간 상태 확인
router.get('/seat-status-realtime/:seatId', async (req, res) => {
  try {
    const { seatId } = req.params;
    const { Seat } = require('../models');
    
    const seat = await Seat.findByPk(seatId);
    
    if (!seat) {
      return res.status(404).json({
        success: false,
        error: 'SEAT_NOT_FOUND',
        message: '좌석을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: {
        id: seat.id,
        status: seat.status,
        bookedBy: seat.bookedBy,
        updatedAt: seat.updatedAt,
        isAvailable: seat.status === 'available'
      },
      message: '좌석 상태 조회 성공'
    });

  } catch (error) {
    console.error('❌ 실시간 좌석 상태 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
