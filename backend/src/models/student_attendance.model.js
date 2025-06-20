const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const StudentAttendance = sequelize.define('StudentAttendance', {
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
  manage_subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'manage_subjects',
      key: 'id'
    }
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'student_schedules',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
    defaultValue: 'present'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  marked_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'student_attendances'
});

module.exports = StudentAttendance;
