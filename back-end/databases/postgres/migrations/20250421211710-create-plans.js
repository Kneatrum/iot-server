'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('plans', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      deviceLimit: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        validate: {
          min: 0,
          max: 20
        }
      },
      dataRetentionDays: {
        allowNull: false,
        type: Sequelize.INTEGER,
        validate: {
          min: 0
        }
      },
      uploadRate: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        validate: {
          min: 1, // 1 second
          max: 600  // 10 minutes
        }
      },
      protocols: {  // Free plan could only support protocols: ['mqtt'], Pro plan could support everything protocols: ['mqtt', 'amqp', 'http', 'coap', 'websocket']
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
      },
      chartsLimit: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        validate: {
          min: 1,
          max: 20
        }
      },
      storage: {
        allowNull: false,
        type: Sequelize.INTEGER,
        validate: {
          min: 100 // 100MB
        }
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('plans');
  }
};
