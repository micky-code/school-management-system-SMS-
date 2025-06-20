const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  fee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fees',
      key: 'id'
    }
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'online_payment'),
    allowNull: false
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receipt_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'completed'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  collected_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'payments'
});

module.exports = Payment;
