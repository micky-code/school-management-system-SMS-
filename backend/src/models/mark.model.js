const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Mark = sequelize.define('Mark', {
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
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'exams',
      key: 'id'
    }
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true
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
  tableName: 'marks'
});

module.exports = Mark;
