'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('layouts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      deviceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'devices', 
          key: 'id' 
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      layout: {
        allowNull: false,
        type: Sequelize.JSONB
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
    await queryInterface.dropTable('layouts');
  }
};