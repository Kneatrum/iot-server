'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      planId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'plans',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'pending', 'canceled', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      autoRenew: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      canceledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      nextBillingDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      billingCycle: {
        type: Sequelize.ENUM('monthly', 'quarterly', 'annual'),
        allowNull: false,
        defaultValue: 'monthly'
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
    await queryInterface.dropTable('subscriptions');
  }
};