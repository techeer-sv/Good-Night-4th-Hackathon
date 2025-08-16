const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite'); // DB 파일 위치

// 데이터베이스 연결만 제공 (테이블 생성은 init-db.js에서 처리)
module.exports = db;