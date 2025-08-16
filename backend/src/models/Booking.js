const { v4: uuidv4 } = require('uuid');

class Booking {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.concertId = data.concertId;
    this.userId = data.userId;
    this.seatIds = data.seatIds || [];
    this.totalAmount = data.totalAmount;
    this.status = data.status || 'pending'; // pending, confirmed, cancelled, completed
    this.paymentMethod = data.paymentMethod;
    this.paymentStatus = data.paymentStatus || 'pending'; // pending, paid, failed, refunded
    this.bookingDate = data.bookingDate || new Date();
    this.expiresAt = data.expiresAt || new Date(Date.now() + 15 * 60 * 1000); // 15분 후 만료
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      concertId: this.concertId,
      userId: this.userId,
      seatIds: this.seatIds,
      totalAmount: this.totalAmount,
      status: this.status,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      bookingDate: this.bookingDate,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  confirm() {
    this.status = 'confirmed';
    this.updatedAt = new Date();
    return this;
  }

  cancel() {
    this.status = 'cancelled';
    this.updatedAt = new Date();
    return this;
  }

  complete() {
    this.status = 'completed';
    this.updatedAt = new Date();
    return this;
  }

  isExpired() {
    return new Date() > this.expiresAt;
  }

  extendExpiration(minutes = 15) {
    this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = Booking;
