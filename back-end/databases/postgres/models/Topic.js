'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
  
    static associate(models) {

      Topic.belongsTo(models.Chart, {
        foreignKey: 'chartId', 
        as: 'chart'
      })

      Topic.belongsTo(models.Device, {
        foreignKey: 'deviceId',
        as: 'device'
      })

    }

    // toJSON(){
    //   return { ...this.get(), id: undefined }
    // }
  }

  Topic.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    chartId: {
      type: DataTypes.UUID,
      references: {
        model: 'charts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      unique: true
    },
    deviceId: {
      type: DataTypes.UUID,
      references: {
        model: 'devices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "topics",
    modelName: 'Topic',
  });

  return Topic;
};