const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const StudentSchedule = sequelize.define('StudentSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  manage_subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'manage_subjects',
      key: 'id'
    }
  },
  day_of_week: {
    type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  room: {
    type: DataTypes.STRING,
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
  semester: {
    type: DataTypes.ENUM('1', '2', 'summer'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'canceled', 'completed'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'student_schedules'
});

module.exports = StudentSchedule;
