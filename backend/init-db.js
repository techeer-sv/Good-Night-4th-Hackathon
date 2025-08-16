const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = './database.sqlite';

console.log('🗄️  데이터베이스 초기화를 시작합니다...');

// 기존 데이터베이스 파일이 있으면 삭제
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('✅ 기존 데이터베이스 파일을 삭제했습니다.');
  } catch (err) {
    console.error('❌ 기존 데이터베이스 파일 삭제 실패:', err.message);
  }
}

// 새로운 데이터베이스 생성
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('🔧 새로운 데이터베이스를 생성하고 테이블을 설정합니다...');
  
  // 사용자 테이블 생성
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT
  )`, (err) => {
    if (err) {
      console.error('❌ users 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ users 테이블이 생성되었습니다.');
    }
  });
  
  // 좌석 예매 테이블 생성
  db.run(`CREATE TABLE IF NOT EXISTS seat_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seat_number INTEGER NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'booked'
  )`, (err) => {
    if (err) {
      console.error('❌ seat_bookings 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ seat_bookings 테이블이 생성되었습니다.');
    }
  });
  
  // 예약자 정보 테이블 생성
  db.run(`CREATE TABLE IF NOT EXISTS customer_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES seat_bookings (id)
  )`, (err) => {
    if (err) {
      console.error('❌ customer_info 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ customer_info 테이블이 생성되었습니다.');
    }
  });
  
  // 샘플 데이터 삽입 (선택사항)
  db.run(`INSERT INTO users (name, email) VALUES (?, ?)`, 
    ['테스트 사용자', 'test@example.com'], 
    function(err) {
      if (err) {
        console.error('❌ 샘플 사용자 데이터 삽입 실패:', err.message);
      } else {
        console.log('✅ 샘플 사용자 데이터가 삽입되었습니다. (ID: ' + this.lastID + ')');
      }
    }
  );
  
  // 데이터베이스 상태 확인
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('❌ 데이터베이스 상태 확인 실패:', err.message);
    } else {
      console.log(`📊 현재 users 테이블 레코드 수: ${row.count}개`);
    }
  });
  
  db.get('SELECT COUNT(*) as count FROM seat_bookings', (err, row) => {
    if (err) {
      console.error('❌ 데이터베이스 상태 확인 실패:', err.message);
    } else {
      console.log(`📊 현재 seat_bookings 테이블 레코드 수: ${row.count}개`);
    }
    
    // 데이터베이스 초기화 완료
    console.log('🎉 데이터베이스 초기화가 완료되었습니다!');
    console.log('🚀 서버를 시작합니다...');
    
    // 데이터베이스 연결 종료
    db.close((err) => {
      if (err) {
        console.error('❌ 데이터베이스 연결 종료 실패:', err.message);
      } else {
        console.log('🔒 데이터베이스 연결이 종료되었습니다.');
      }
    });
  });
});

// 에러 핸들링
db.on('error', (err) => {
  console.error('❌ 데이터베이스 오류:', err.message);
  process.exit(1);
});
