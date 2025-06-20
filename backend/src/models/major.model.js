const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Major = sequelize.define('Major', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  major_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  coordinator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'majors'
});

module.exports = Major;
