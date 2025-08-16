const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Backend API 서버가 실행 중입니다!' });
});

// API 라우트
app.get('/api/test', (req, res) => {
  res.json({ message: 'API 테스트 성공!', timestamp: new Date().toISOString() });
});

// 데이터베이스 연결 테스트 API
app.get('/api/db-test', (req, res) => {
  db.get('SELECT 1 as test', (err, row) => {
    if (err) {
      console.error('데이터베이스 연결 테스트 실패:', err);
      res.status(500).json({
        success: false,
        message: '데이터베이스 연결 실패',
        error: err.message
      });
    } else {
      res.json({
        success: true,
        message: '데이터베이스 연결 성공',
        test: row.test,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// 데이터베이스 테이블 상태 확인 API
app.get('/api/db-status', (req, res) => {
  const status = {};
  
  // 테이블 존재 여부 확인
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '테이블 목록 조회 실패',
        error: err.message
      });
    }
    
    status.tables = tables.map(t => t.name);
    
    // 각 테이블의 레코드 수 확인
    const tableCounts = {};
    let completedTables = 0;
    
    if (tables.length === 0) {
      return res.json({
        success: true,
        message: '데이터베이스가 비어있습니다',
        status: status
      });
    }
    
    tables.forEach(table => {
      db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
        if (err) {
          tableCounts[table.name] = { error: err.message };
        } else {
          tableCounts[table.name] = { count: row.count };
        }
        
        completedTables++;
        
        if (completedTables === tables.length) {
          status.tableCounts = tableCounts;
          
          res.json({
            success: true,
            message: '데이터베이스 상태 확인 완료',
            status: status,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  });
});

// 좌석 예매 API
app.post('/api/book-seats', (req, res) => {
  console.log('예매 요청 받음:', req.body);
  
  const { seats, customerInfo } = req.body;
  
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    console.log('좌석 정보 검증 실패:', seats);
    return res.status(400).json({ 
      success: false, 
      message: '좌석 정보가 올바르지 않습니다.' 
    });
  }

  if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
    console.log('예약자 정보 검증 실패:', customerInfo);
    return res.status(400).json({ 
      success: false, 
      message: '예약자 정보가 올바르지 않습니다.' 
    });
  }

  console.log('데이터 검증 통과, 트랜잭션 시작...');

  // 트랜잭션 시작
  db.serialize(() => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('트랜잭션 시작 실패:', err);
        return res.status(500).json({
          success: false,
          message: '데이터베이스 트랜잭션을 시작할 수 없습니다.'
        });
      }
      
      console.log('트랜잭션 시작됨');
      
      const insertPromises = seats.map(seatNumber => {
        return new Promise((resolve, reject) => {
          console.log(`좌석 ${seatNumber} 삽입 시도...`);
          db.run(
            'INSERT INTO seat_bookings (seat_number) VALUES (?)',
            [seatNumber],
            function(err) {
              if (err) {
                console.error(`좌석 ${seatNumber} 삽입 실패:`, err);
                reject(err);
              } else {
                console.log(`좌석 ${seatNumber} 삽입 성공, ID: ${this.lastID}`);
                resolve({ seatNumber, id: this.lastID });
              }
            }
          );
        });
      });

      Promise.all(insertPromises)
        .then(results => {
          console.log('모든 좌석 삽입 완료:', results);
          
          // 예약자 정보 저장
          const customerInsertPromises = results.map(booking => {
            return new Promise((resolve, reject) => {
              console.log(`예약자 정보 삽입 시도 (booking_id: ${booking.id})...`);
              db.run(
                'INSERT INTO customer_info (booking_id, name, email, phone) VALUES (?, ?, ?, ?)',
                [booking.id, customerInfo.name, customerInfo.email, customerInfo.phone],
                function(err) {
                  if (err) {
                    console.error(`예약자 정보 삽입 실패 (booking_id: ${booking.id}):`, err);
                    reject(err);
                  } else {
                    console.log(`예약자 정보 삽입 성공 (customer_id: ${this.lastID})`);
                    resolve({ customerId: this.lastID, bookingId: booking.id });
                  }
                }
              );
            });
          });

          return Promise.all(customerInsertPromises);
        })
        .then(customerResults => {
          console.log('모든 예약자 정보 삽입 완료:', customerResults);
          
          // 트랜잭션 커밋
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('트랜잭션 커밋 실패:', err);
              db.run('ROLLBACK', (rollbackErr) => {
                if (rollbackErr) {
                  console.error('롤백 실패:', rollbackErr);
                }
              });
              throw err;
            }
            
            console.log('트랜잭션 커밋 성공');
            
            res.json({
              success: true,
              message: '좌석 예매가 완료되었습니다.',
              bookedSeats: seats,
              customerInfo: customerInfo
            });
          });
        })
        .catch(err => {
          // 오류 발생 시 롤백
          console.error('예매 처리 중 오류 발생:', err);
          db.run('ROLLBACK', (rollbackErr) => {
            if (rollbackErr) {
              console.error('롤백 실패:', rollbackErr);
            }
            console.log('트랜잭션 롤백 완료');
          });
          
          res.status(500).json({
            success: false,
            message: `좌석 예매 중 오류가 발생했습니다: ${err.message}`
          });
        });
    });
  });
});

// 예매된 좌석 조회 API
app.get('/api/booked-seats', (req, res) => {
  db.all('SELECT seat_number FROM seat_bookings ORDER BY seat_number', (err, rows) => {
    if (err) {
      console.error('좌석 조회 오류:', err);
      return res.status(500).json({
        success: false,
        message: '좌석 조회 중 오류가 발생했습니다.'
      });
    }
    
    // 좌석 번호만 배열로 추출
    const bookedSeatNumbers = rows.map(row => row.seat_number);
    
    res.json({
      success: true,
      bookedSeats: bookedSeatNumbers
    });
  });
});

// 예약자 정보 조회 API
app.get('/api/customer-info', (req, res) => {
  const query = `
    SELECT 
      sb.seat_number,
      sb.booking_date,
      ci.name,
      ci.email,
      ci.phone
    FROM seat_bookings sb
    LEFT JOIN customer_info ci ON sb.id = ci.booking_id
    ORDER BY sb.booking_date DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('예약자 정보 조회 오류:', err);
      return res.status(500).json({
        success: false,
        message: '예약자 정보 조회 중 오류가 발생했습니다.'
      });
    }
    
    res.json({
      success: true,
      bookings: rows
    });
  });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
});

// 404 핸들링
app.use('*', (req, res) => {
  res.status(404).json({ message: '요청한 경로를 찾을 수 없습니다.' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}`);
}); 