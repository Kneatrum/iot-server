'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('plans', [
      {
        id: uuidv4(),
        name: 'Hobbyist (Free)',
        price: 0.00,
        deviceLimit: 1,
        dataRetentionDays: 14, // 2 weeks
        uploadRate: 300, // 5 minutes
        protocols: ['mqtt'],
        chartsLimit: 4,
        storage: 100, // 100MB
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Startup (Basic)',
        price: 5.00,
        deviceLimit: 3,
        dataRetentionDays: 90, // 3 months
        uploadRate: 120, // 2 minutes
        protocols: ['mqtt', 'http'],
        chartsLimit: 6,
        storage: 1000, // 1GB
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Business (Advanced)',
        price: 10.00,
        deviceLimit: 5,
        dataRetentionDays: 180, // 6 months
        uploadRate: 60, // 1 minutes
        protocols: ['mqtt', 'http', 'amqp'],
        chartsLimit: 10,
        storage: 100000, // 100GB
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Enterprise (Pro)',
        price: 20.00,
        deviceLimit: 15,
        dataRetentionDays: 365, // 1 year
        uploadRate: 1, // 1 second
        protocols: ['mqtt', 'http', 'amqp', 'coap', 'websocket'],
        chartsLimit: 15,
        storage: 1000000, // 1000GB or 1TB
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('plans', null, {});
  }
};
