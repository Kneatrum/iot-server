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

    toJSON(){
      return { ...this.get(), id: undefined }
    }
  }

  Topic.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    chartId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'charts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    deviceId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'devices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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