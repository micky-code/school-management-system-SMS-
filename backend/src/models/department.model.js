const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  department_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dean_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  established_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'departments'
});

module.exports = Department;
