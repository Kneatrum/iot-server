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

    // toJSON(){
    //   return { ...this.get(), id: undefined }
    // }

  }

  Layout.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    deviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'devices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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