const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  credit_hours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'subjects'
});

module.exports = Subject;
