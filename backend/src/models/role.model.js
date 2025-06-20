const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Role = sequelize.define('tbl_role', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'tbl_role'
});

module.exports = Role;
