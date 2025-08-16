const Concert = require('../models/Concert');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

class DataStore {
  constructor() {
    this.concerts = new Map();
    this.seats = new Map();
    this.bookings = new Map();
    this.users = new Map();
    
    // 샘플 데이터 초기화
    this.initializeSampleData();
  }

  // 샘플 데이터 초기화
  initializeSampleData() {
    // 샘플 공연 데이터
    const sampleConcerts = [
      {
        title: '2024 K-POP Festival',
        artist: 'Various Artists',
        date: '2024-12-31T19:00:00Z',
        venue: '올림픽공원 체조경기장',
        totalSeats: 9,
        price: 150000
      },
      {
        title: 'Classical Symphony Night',
        artist: 'Seoul Philharmonic Orchestra',
        date: '2024-12-25T20:00:00Z',
        venue: '예술의전당',
        totalSeats: 9,
        price: 80000
      },
      {
        title: 'Rock Concert 2024',
        artist: 'The Rock Band',
        date: '2024-12-28T21:00:00Z',
        venue: '잠실실내체육관',
        totalSeats: 9,
        price: 120000
      }
    ];

    sampleConcerts.forEach((concertData, index) => {
      const concert = new Concert(concertData);
      this.concerts.set(concert.id, concert);
      
      // 각 공연에 대한 좌석 생성 (3x3 격자)
      this.generateSeatsForConcert(concert.id, concert.totalSeats, concert.price);
    });

    // 샘플 사용자 데이터
    const sampleUsers = [
      { id: 'user1', name: '김철수', email: 'kim@example.com', priority: 'normal' },
      { id: 'user2', name: '이영희', email: 'lee@example.com', priority: 'premium' },
      { id: 'user3', name: '박민수', email: 'park@example.com', priority: 'vip' }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  // 공연별 좌석 생성 (3x3 격자)
  generateSeatsForConcert(concertId, totalSeats, basePrice) {
    // 3x3 격자로 9개 좌석 생성
    const sections = ['A'];
    const rowsPerSection = 3;
    const seatsPerRow = 3;

    let seatNumber = 1;
    
    sections.forEach((section, sectionIndex) => {
      for (let row = 1; row <= rowsPerSection; row++) {
        for (let seat = 1; seat <= seatsPerRow; seat++) {
          if (seatNumber > totalSeats) break;
          
          // 모든 좌석을 동일한 가격으로 설정
          const price = basePrice;
          
          // 모든 좌석을 normal 우선순위로 설정
          const priority = 'normal';
          
          const seatData = {
            concertId,
            seatNumber: seatNumber++,
            row,
            section,
            price,
            priority
          };
          
          const seat = new Seat(seatData);
          this.seats.set(seat.id, seat);
        }
      }
    });
  }

  // 공연 관련 메서드
  getAllConcerts() {
    return Array.from(this.concerts.values()).map(concert => concert.toJSON());
  }

  getConcertById(id) {
    const concert = this.concerts.get(id);
    return concert ? concert.toJSON() : null;
  }

  createConcert(concertData) {
    const concert = new Concert(concertData);
    this.concerts.set(concert.id, concert);
    this.generateSeatsForConcert(concert.id, concert.totalSeats, concert.price);
    return concert.toJSON();
  }

  // 좌석 관련 메서드
  getSeatsByConcertId(concertId) {
    return Array.from(this.seats.values())
      .filter(seat => seat.concertId === concertId)
      .map(seat => seat.toJSON());
  }

  getSeatById(id) {
    const seat = this.seats.get(id);
    return seat ? seat.toJSON() : null;
  }

  updateSeat(id, updates) {
    const seat = this.seats.get(id);
    if (seat) {
      seat.update(updates);
      return seat.toJSON();
    }
    return null;
  }

  // 예매 관련 메서드
  getAllBookings() {
    return Array.from(this.bookings.values()).map(booking => booking.toJSON());
  }

  getBookingById(id) {
    const booking = this.bookings.get(id);
    return booking ? booking.toJSON() : null;
  }

  getBookingsByUserId(userId) {
    return Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId)
      .map(booking => booking.toJSON());
  }

  createBooking(bookingData) {
    const booking = new Booking(bookingData);
    this.bookings.set(booking.id, booking);
    return booking.toJSON();
  }

  updateBooking(id, updates) {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.update(updates);
      return booking.toJSON();
    }
    return null;
  }

  // 사용자 관련 메서드
  getUserById(id) {
    return this.users.get(id);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  // 통계 메서드
  getConcertStats(concertId) {
    const seats = this.getSeatsByConcertId(concertId);
    const totalSeats = seats.length;
    const availableSeats = seats.filter(seat => seat.status === 'available').length;
    const reservedSeats = seats.filter(seat => seat.status === 'reserved').length;
    const bookedSeats = seats.filter(seat => seat.status === 'booked').length;

    return {
      totalSeats,
      availableSeats,
      reservedSeats,
      bookedSeats,
      occupancyRate: ((totalSeats - availableSeats) / totalSeats * 100).toFixed(2)
    };
  }

  // 데이터 초기화 (테스트용)
  clearAll() {
    this.concerts.clear();
    this.seats.clear();
    this.bookings.clear();
    this.users.clear();
  }
}

module.exports = DataStore;
