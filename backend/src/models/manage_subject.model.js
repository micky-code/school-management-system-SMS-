const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const ManageSubject = sequelize.define('ManageSubject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
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
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
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
  short_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  semester: {
    type: DataTypes.ENUM('1', '2', 'summer'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'manage_subjects'
});

module.exports = ManageSubject;
