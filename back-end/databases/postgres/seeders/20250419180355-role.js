'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        id: uuidv4(),
        name: 'admin',
        permissions: JSON.stringify({
          canAccessAnalytics: true,
          canManageUsers: true,
          canChangeRoles: true,
          canAccessAdminPanel: true,
          canAddDevices: true,
          canDeleteOwnDevices: true,
          canEditDevices: true,
          canUploadData: true
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'user',
        permissions: JSON.stringify({
          canAccessAnalytics: false,
          canManageUsers: false,
          canChangeRoles: false,
          canAccessAdminPanel: false,
          canAddDevices: true,
          canDeleteOwnDevices: true,
          canEditDevices: true,
          canUploadData: true
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
