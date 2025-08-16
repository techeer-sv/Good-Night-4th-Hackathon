const { v4: uuidv4 } = require('uuid');

class Seat {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.concertId = data.concertId;
    this.seatNumber = data.seatNumber;
    this.row = data.row;
    this.section = data.section;
    this.status = data.status || 'available'; // available, reserved, booked, maintenance
    this.price = data.price;
    this.priority = data.priority || 'normal'; // normal, premium, vip
    this.reservedAt = data.reservedAt || null;
    this.reservedBy = data.reservedBy || null;
    this.bookedAt = data.bookedAt || null;
    this.bookedBy = data.bookedBy || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      concertId: this.concertId,
      seatNumber: this.seatNumber,
      row: this.row,
      section: this.section,
      status: this.status,
      price: this.price,
      priority: this.priority,
      reservedAt: this.reservedAt,
      reservedBy: this.reservedBy,
      bookedAt: this.bookedAt,
      bookedBy: this.bookedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  reserve(userId, duration = 300000) { // 기본 5분 예약
    if (this.status !== 'available') {
      throw new Error('좌석을 예약할 수 없습니다.');
    }
    
    this.status = 'reserved';
    this.reservedAt = new Date();
    this.reservedBy = userId;
    this.updatedAt = new Date();
    
    // 자동 예약 해제 타이머
    setTimeout(() => {
      if (this.status === 'reserved' && this.reservedBy === userId) {
        this.status = 'available';
        this.reservedAt = null;
        this.reservedBy = null;
        this.updatedAt = new Date();
      }
    }, duration);
    
    return this;
  }

  book(userId) {
    if (this.status !== 'available' && this.status !== 'reserved') {
      throw new Error('좌석을 예매할 수 없습니다.');
    }
    
    this.status = 'booked';
    this.bookedAt = new Date();
    this.bookedBy = userId;
    this.reservedAt = null;
    this.reservedBy = null;
    this.updatedAt = new Date();
    
    return this;
  }

  release() {
    this.status = 'available';
    this.reservedAt = null;
    this.reservedBy = null;
    this.bookedAt = null;
    this.bookedBy = null;
    this.updatedAt = new Date();
    
    return this;
  }
}

module.exports = Seat;
