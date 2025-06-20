const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const StudentScholarship = sequelize.define('StudentScholarship', {
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
  scholarship_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'scholarships',
      key: 'id'
    }
  },
  academic_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'academic_years',
      key: 'id'
    }
  },
  amount_awarded: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  award_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'revoked', 'completed'),
    defaultValue: 'active'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'student_scholarships'
});

module.exports = StudentScholarship;
