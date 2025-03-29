'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
   
    static associate(models) {

        Device.belongsTo(models.User, {
          foreignKey: 'userId', 
          as: 'user' 
        });
      
        Device.hasMany(models.Layout, {
          foreignKey: 'deviceId', 
          as: 'layouts'
        });

        Device.hasMany(models.Topic, {
          foreignKey: 'deviceId', 
          as: 'topics' 
        })

    }

    // toJSON(){
    //   return { ...this.get(), id: undefined }
    // }

  }

  Device.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    deviceName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    serialNumber: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    activeStatus: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    tableName: "devices",
    modelName: 'Device',
  });

  return Device;
};