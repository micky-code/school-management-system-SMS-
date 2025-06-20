const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const AcademicYear = sequelize.define('AcademicYear', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  school_year: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  is_current: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'academic_years'
});

module.exports = AcademicYear;
