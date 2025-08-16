const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 개발 환경 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`🌍 환경: ${process.env.NODE_ENV}`);

// 데이터베이스 초기화
const { sequelize, testConnection, initializeDatabase } = require('./models');

// Redis 연결 테스트
const { testRedisConnection } = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10000, // 최대 10000개 요청 (개발 환경용으로 대폭 증가)
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 개발 환경에서는 모든 API 요청에 대해 제한을 완화
    return process.env.NODE_ENV === 'development';
  }
});
app.use('/api/', limiter);

// API 라우트
app.use('/api/concerts', require('./routes/concerts'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/concurrency', require('./routes/concurrency')); // 새로운 동시성 제어 API

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Techeer Hackathon Backend Server',
    version: '1.0.0',
    features: [
      '공연 좌석 예매 시스템',
      'SQLite 데이터베이스',
      'Redis 분산 락',
      '고급 동시성 제어',
      '대기열 시스템',
      '실시간 좌석 모니터링'
    ],
    endpoints: {
      concerts: '/api/concerts',
      bookings: '/api/bookings',
      concurrency: '/api/concurrency'
    }
  });
});

// 헬스 체크
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const redisStatus = await testRedisConnection();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus ? 'healthy' : 'unhealthy',
        redis: redisStatus ? 'healthy' : 'unhealthy'
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: '서비스 상태 확인에 실패했습니다.'
    });
  }
});

// API 문서
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Techeer Hackathon API 문서',
    version: '1.0.0',
    endpoints: {
      'GET /api/concerts': '공연 목록 조회',
      'GET /api/concerts/:id': '공연 상세 정보 조회',
      'POST /api/bookings': '기본 좌석 예매',
      'POST /api/concurrency/book-seats': '고급 동시성 제어 좌석 예매',
      'POST /api/concurrency/join-queue': '대기열 등록',
      'GET /api/concurrency/queue-position/:concertId/:userId': '대기열 위치 확인',
      'GET /api/concurrency/seat-status/:seatId': '좌석 상태 실시간 모니터링',
      'GET /api/concurrency/lock-status/:seatId': '락 상태 확인'
    },
    features: {
      '분산 락': 'Redis를 사용한 좌석 잠금 시스템',
      '낙관적 락': '버전 기반 동시성 제어',
      '대기열 시스템': '우선순위 기반 대기열 관리',
      '실시간 모니터링': '좌석 및 락 상태 실시간 확인'
    }
  });
});

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 전역 오류 처리
app.use((error, req, res, next) => {
  console.error('❌ 서버 오류 발생:', error);
  
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다.'
  });
});

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 테스트
    await testConnection();

    // Redis 연결 테스트
    await testRedisConnection();

    // 데이터베이스 초기화 (샘플 데이터 생성)
    await initializeDatabase();

    // 서버 시작
    app.listen(PORT, () => {
      console.log('==================================================');
      console.log('======== Techeer Hackathon Backend Server ========');
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`API Docs: http://localhost:${PORT}/api/docs`);
      console.log('공연 좌석 예매 시스템 백엤드');
      console.log('SQLite 데이터베이스 연동 완료');
      console.log('Redis 분산 락 시스템 활성화');
      console.log('고급 동시성 제어 시스템 활성화');
      console.log('대기열 시스템 활성화');
      console.log('실시간 좌석 모니터링 활성화');
      console.log('==================================================');
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();
