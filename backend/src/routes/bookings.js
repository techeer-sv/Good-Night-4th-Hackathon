const express = require('express');
const router = express.Router();
const BookingService = require('../services/BookingService');

const bookingService = new BookingService();

// 좌석 예약
router.post('/reserve', async (req, res) => {
  try {
    const { concertId, seatIds, userId } = req.body;

    // 입력 검증
    if (!concertId || !seatIds || !userId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: '필수 필드가 누락되었습니다.'
      });
    }

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_SEAT_IDS',
        message: '유효한 좌석 ID가 필요합니다.'
      });
    }

    const result = await bookingService.reserveSeats(concertId, seatIds, userId);
    
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

// 좌석 예매 (예약된 좌석을 실제 예매로 전환)
router.post('/book', async (req, res) => {
  try {
    const { concertId, seatIds, userId, paymentMethod } = req.body;

    // 입력 검증
    if (!concertId || !seatIds || !userId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: '필수 필드가 누락되었습니다.'
      });
    }

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_SEAT_IDS',
        message: '유효한 좌석 ID가 필요합니다.'
      });
    }

    const result = await bookingService.bookSeats(concertId, seatIds, userId, paymentMethod);
    
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

// 좌석 예약 해제
router.delete('/reserve', async (req, res) => {
  try {
    const { seatIds, userId } = req.body;

    // 입력 검증
    if (!seatIds || !userId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: '필수 필드가 누락되었습니다.'
      });
    }

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_SEAT_IDS',
        message: '유효한 좌석 ID가 필요합니다.'
      });
    }

    const result = await bookingService.releaseSeats(seatIds, userId);
    
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

// 예매 내역 조회
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await bookingService.getBookingsByUserId(userId);
    
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

// 특정 예매 내역 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: 예매 ID로 조회하는 로직 구현
    res.status(501).json({
      success: false,
      error: 'NOT_IMPLEMENTED',
      message: '아직 구현되지 않은 기능입니다.'
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
