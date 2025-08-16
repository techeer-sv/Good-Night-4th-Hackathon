const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Seat = sequelize.define('Seat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  concertId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'concerts',
      key: 'id'
    }
  },
  seatNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  row: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'A'
  },
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'booked', 'maintenance'),
    defaultValue: 'available'
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('normal', 'premium', 'vip'),
    defaultValue: 'normal'
  },
  // 낙관적 락을 위한 버전 필드
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  reservedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reservedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bookedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  bookedBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'seats',
  timestamps: true
});

module.exports = Seat;
