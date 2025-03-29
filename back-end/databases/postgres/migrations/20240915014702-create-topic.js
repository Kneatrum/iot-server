'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('topics', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      chartId: {
        type: Sequelize.UUID,
        references: {
          model: 'charts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      deviceId: {
        type: Sequelize.UUID,
        references: {
          model: 'devices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      topic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('topics');
  }
};