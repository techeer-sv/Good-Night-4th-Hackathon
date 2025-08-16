const express = require('express');
const router = express.Router();
const BookingService = require('../services/BookingService');

const bookingService = new BookingService();

// 우선순위 대기열 등록
router.post('/join', async (req, res) => {
  try {
    const { concertId, userId, priority = 'normal' } = req.body;

    // 입력 검증
    if (!concertId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: '필수 필드가 누락되었습니다.'
      });
    }

    // 우선순위 검증
    const validPriorities = ['normal', 'premium', 'vip'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PRIORITY',
        message: '유효하지 않은 우선순위입니다.'
      });
    }

    const result = await bookingService.joinWaitingQueue(concertId, userId, priority);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 대기열 상태 확인
router.get('/status/:concertId', async (req, res) => {
  try {
    const { concertId } = req.params;
    const result = await bookingService.getWaitingQueueStatus(concertId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 대기열에서 나가기
router.delete('/leave', async (req, res) => {
  try {
    const { concertId, userId } = req.body;

    // 입력 검증
    if (!concertId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: '필수 필드가 누락되었습니다.'
      });
    }

    // 대기열에서 제거
    const removed = bookingService.priorityQueue.removeByUserId(userId);
    
    if (removed) {
      res.json({
        success: true,
        message: '대기열에서 성공적으로 나갔습니다.',
        data: { removedItem: removed }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'NOT_IN_QUEUE',
        message: '대기열에 등록되어 있지 않습니다.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 대기열 전체 상태 확인 (관리자용)
router.get('/admin/status', async (req, res) => {
  try {
    const status = bookingService.priorityQueue.getStatus();
    
    res.json({
      success: true,
      data: {
        ...status,
        queueDetails: bookingService.priorityQueue.queue.map((item, index) => ({
          position: index + 1,
          userId: item.item.userId,
          concertId: item.item.concertId,
          priority: item.priority,
          timestamp: item.timestamp,
          waitTime: Date.now() - item.timestamp
        }))
      },
      message: '대기열 전체 상태를 성공적으로 조회했습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
