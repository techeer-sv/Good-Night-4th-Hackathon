const { v4: uuidv4 } = require('uuid');

class Concert {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.artist = data.artist;
    this.date = data.date;
    this.venue = data.venue;
    this.totalSeats = data.totalSeats;
    this.price = data.price;
    this.status = data.status || 'upcoming'; // upcoming, ongoing, completed, cancelled
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      date: this.date,
      venue: this.venue,
      totalSeats: this.totalSeats,
      price: this.price,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = Concert;
