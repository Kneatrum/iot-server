'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      // Define association with User
      Subscription.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Define association with Plan
      Subscription.belongsTo(models.Plan, {
        foreignKey: 'planId',
        as: 'plan'
      });
      
      // Define association with Payments
      Subscription.hasMany(models.Payment, {
        foreignKey: 'subscriptionId',
        as: 'payments'
      });
    }
  }
  
  Subscription.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'plans',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending', 'canceled', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    nextBillingDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'annual'),
      allowNull: false,
      defaultValue: 'monthly'
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    canceledAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: true
  });
  
  return Subscription;
};