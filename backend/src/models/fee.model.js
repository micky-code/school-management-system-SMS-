const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fee_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fee_type: {
    type: DataTypes.ENUM('tuition', 'registration', 'library', 'laboratory', 'transportation', 'other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  academic_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'academic_years',
      key: 'id'
    }
  },
  main_program_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'main_programs',
      key: 'id'
    }
  },
  major_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'majors',
      key: 'id'
    }
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'fees'
});

module.exports = Fee;
