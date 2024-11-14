'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Layout extends Model {
  
    static associate(models) {
      Layout.belongsTo(models.Device, { 
        foreignKey: 'deviceId', 
        as: 'device'
      });
      
      Layout.hasMany(models.Chart, { 
        foreignKey: 'layoutId', 
        as: 'chart'
      });
    }
  }

  Layout.init({
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'devices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    layout: {
      allowNull: false,
      type: DataTypes.JSONB
    },
  }, {
    sequelize,
    tableName: "layouts",
    modelName: 'Layout',
  });

  return Layout;
};