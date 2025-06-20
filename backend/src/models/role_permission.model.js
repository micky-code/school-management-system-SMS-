const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false
  },
  can_create: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  can_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  can_update: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  can_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'role_permissions'
});

module.exports = RolePermission;
