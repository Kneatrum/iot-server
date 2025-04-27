'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Define association with Subscription
      Payment.belongsTo(models.Subscription, {
        foreignKey: 'subscriptionId',
        as: 'subscription'
      });
    }
  }
  
  Payment.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    subscriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'subscriptions',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD'
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    status: {
        type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    paymentReference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    billingPeriodStart: {
        type: DataTypes.DATE,
        allowNull: false
    },
    billingPeriodEnd: {
        type: DataTypes.DATE,
        allowNull: false
    }
  }, {
        sequelize,
        modelName: 'Payment',
        tableName: 'payments',
        timestamps: true
  });
  
  return Payment;
};