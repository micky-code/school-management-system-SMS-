const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  exam_type: {
    type: DataTypes.ENUM('quiz', 'mid-term', 'final', 'assignment', 'project'),
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
  major_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'majors',
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
  exam_date: {
    type: DataTypes.DATEONLY,
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
  total_marks: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  passing_marks: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'canceled'),
    defaultValue: 'scheduled'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'exams'
});

module.exports = Exam;
