'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        subscriptionId: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
            model: 'subscriptions',
            key: 'id'
            },
            onDelete: 'CASCADE'
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'USD'
        },
        paymentDate: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        status: {
            type: Sequelize.ENUM('pending', 'succeeded', 'failed', 'refunded'),
            allowNull: false,
            defaultValue: 'pending'
        },
        paymentMethod: {
            type: Sequelize.STRING,
            allowNull: false
        },
        transactionId: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        paymentReference: {
            type: Sequelize.STRING,
            allowNull: true
        },
        invoiceNumber: {
            type: Sequelize.STRING,
            allowNull: true
        },
        billingPeriodStart: {
            type: Sequelize.DATE,
            allowNull: false
        },
        billingPeriodEnd: {
            type: Sequelize.DATE,
            allowNull: false
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};