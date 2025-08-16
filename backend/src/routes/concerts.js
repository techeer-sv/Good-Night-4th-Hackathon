const express = require('express');
const router = express.Router();
const BookingService = require('../services/BookingService');

const bookingService = new BookingService();

// 공연 목록 조회
router.get('/', async (req, res) => {
  try {
    const result = await bookingService.getConcerts();
    
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

// 공연 상세 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await bookingService.getConcertById(id);
    
    if (result.success) {
      res.json(result);
    } else {
      if (result.error === 'NOT_FOUND') {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 공연별 좌석 정보 조회
router.get('/:id/seats', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await bookingService.getConcertById(id);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          concert: {
            id: result.data.id,
            title: result.data.title,
            artist: result.data.artist,
            date: result.data.date,
            venue: result.data.venue
          },
          seats: result.data.seats,
          stats: result.data.stats
        },
        message: '좌석 정보를 성공적으로 조회했습니다.'
      });
    } else {
      if (result.error === 'NOT_FOUND') {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
