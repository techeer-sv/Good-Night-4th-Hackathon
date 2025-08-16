const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '../../database.sqlite');

// Sequelize 인스턴스 생성
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // 개발 중에는 true로 설정 가능
  define: {
    timestamps: true,
    underscored: true,
  }
});

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite 데이터베이스 연결 성공');
  } catch (error) {
    console.error('❌ SQLite 데이터베이스 연결 실패:', error);
  }
};

module.exports = { sequelize, testConnection };
