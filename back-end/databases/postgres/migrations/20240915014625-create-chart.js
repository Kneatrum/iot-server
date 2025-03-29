'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('charts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      layoutId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'layouts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      chartType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      config: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      dateSpan: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('charts');
  }
};