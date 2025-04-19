'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
   
    static associate(models) {
        Plan.hasMany(models.User, { foreignKey: 'planId' });
    }

    // toJSON(){
    //   return { ...this.get(), id: undefined }
    // }

  }

  Plan.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    deviceLimit: {
        allowNull: false,
        type: DataTypes.SMALLINT,
        validate: {
            min: 0,
            max: 20
        }
    },
    dataRetentionDays: {
        allowNull: false,
        type: DataTypes.INTEGER,
        validate: {
            min: 0
        }
    },
    uploadRate: {
        allowNull: false,
        type: DataTypes.SMALLINT,
        validate: {
            min: 1, // 1 second
            max: 600 // 10 minutes
        }
    },
    protocols: {  // Free plan could only support protocols: ['mqtt'], Pro plan could support everything protocols: ['mqtt', 'amqp', 'http', 'coap', 'websocket']
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: []
    },
    chartsLimit: {
        allowNull: false,
        type: DataTypes.SMALLINT,
        validate: {
            min: 1,
            max: 20
        }
    },
    storage: {
        allowNull: false,
        type: DataTypes.INTEGER,
        validate: {
            min: 100 // 100MB
        }
    },
  }, {
    sequelize,
    tableName: "plans",
    modelName: 'Plan'
  });

  return Plan;
};