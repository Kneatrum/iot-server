'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
   
    static associate(models) {

        Device.belongsTo(models.User, {
          foreignKey: 'userId', 
          as: 'user' 
        });
      
        Device.hasOne(models.Layout, {
          foreignKey: 'deviceId', 
          as: 'layout'
        });

        Device.hasMany(models.Topic, {
          foreignKey: 'deviceId', 
          as: 'topics' 
        })

    }
  }

  Device.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    deviceName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    serialNumber: {
      allowNull: false,
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    tableName: "devices",
    modelName: 'Device',
  });

  return Device;
};