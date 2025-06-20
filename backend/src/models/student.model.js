const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Student = sequelize.define('tbl_student', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  std_eng_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  std_khmer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  program_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  batch_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  from_high_school: {
    type: DataTypes.STRING,
    allowNull: false
  },
  race: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nationaly: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marital_status_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  phone: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  parent_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  province_no: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  district_no: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  commune_no: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  village_no: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  std_status_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  major_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  enrollment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  graduation_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended'),
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tbl_student',
  timestamps: false
});

module.exports = Student;
