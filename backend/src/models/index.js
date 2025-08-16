const { sequelize, testConnection } = require('../config/database');
const Concert = require('./ConcertModel');
const Seat = require('./SeatModel');
const Booking = require('./BookingModel');

// 모델 간 관계 설정
Concert.hasMany(Seat, { foreignKey: 'concertId', as: 'seats' });
Seat.belongsTo(Concert, { foreignKey: 'concertId', as: 'concert' });

Concert.hasMany(Booking, { foreignKey: 'concertId', as: 'bookings' });
Booking.belongsTo(Concert, { foreignKey: 'concertId', as: 'concert' });

// 데이터베이스 동기화 및 샘플 데이터 생성
const initializeDatabase = async () => {
  try {
    // 데이터베이스 테이블 생성
    await sequelize.sync({ force: true }); // force: true는 기존 테이블을 삭제하고 새로 생성
    console.log('✅ 데이터베이스 테이블 생성 완료');

    // 샘플 공연 데이터 생성
    const concerts = await Concert.bulkCreate([
      {
        title: 'K-Pop Night',
        artist: 'Various Artists',
        date: new Date('2024-12-25T20:00:00'),
        venue: '올림픽공원',
        totalSeats: 9,
        price: 80000,
        status: 'upcoming'
      },
      {
        title: 'Classical Symphony Night',
        artist: 'Seoul Philharmonic Orchestra',
        date: new Date('2024-12-26T05:00:00'),
        venue: '예술의전당',
        totalSeats: 9,
        price: 80000,
        status: 'upcoming'
      },
      {
        title: 'Rock Concert 2024',
        artist: 'The Rock Band',
        date: new Date('2024-12-29T06:00:00'),
        venue: '잠실실내체육관',
        totalSeats: 9,
        price: 120000,
        status: 'upcoming'
      }
    ]);

    console.log('✅ 샘플 공연 데이터 생성 완료');

    // 각 공연에 대한 좌석 데이터 생성 (3x3 격자)
    for (const concert of concerts) {
      const seats = [];
      for (let row = 1; row <= 3; row++) {
        for (let seatNum = 1; seatNum <= 3; seatNum++) {
          seats.push({
            concertId: concert.id,
            seatNumber: seatNum,
            row: row,
            section: 'A',
            status: 'available',
            price: concert.price,
            priority: 'normal'
          });
        }
      }
      await Seat.bulkCreate(seats);
    }

    console.log('✅ 샘플 좌석 데이터 생성 완료');
    console.log('🎭 데이터베이스 초기화 완료!');

  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
  }
};

module.exports = {
  sequelize,
  Concert,
  Seat,
  Booking,
  initializeDatabase,
  testConnection
};
