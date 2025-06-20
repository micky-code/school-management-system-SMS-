const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const StudentPromotion = sequelize.define('StudentPromotion', {
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
  from_academic_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'academic_years',
      key: 'id'
    }
  },
  to_academic_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'academic_years',
      key: 'id'
    }
  },
  from_major_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'majors',
      key: 'id'
    }
  },
  to_major_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'majors',
      key: 'id'
    }
  },
  promotion_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('promoted', 'demoted', 'transferred'),
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  promoted_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'student_promotions'
});

module.exports = StudentPromotion;
