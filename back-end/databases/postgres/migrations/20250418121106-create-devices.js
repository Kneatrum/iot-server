'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('devices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', 
          key: 'id' 
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      uniqueHash: {
        type: Sequelize.CHAR(12),
        allowNull: false,
        unique: true
      },
      deviceName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      serialNumber: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      activeStatus: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    await queryInterface.addIndex('devices', ['userId', 'serialNumber'], {
      unique: true,
      name: 'user_device_serial_unique'
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('devices');
  }
};