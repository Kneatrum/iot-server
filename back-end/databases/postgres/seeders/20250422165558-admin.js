'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const timestamp = new Date();

    // First, get or create the admin role from the roles table
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('admin', 'user')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Use existing role IDs
    const adminRoleId = roles.find(role => role.name === 'admin')?.id;
    const userRoleId = roles.find(role => role.name === 'user')?.id;
    
    if (!adminRoleId || !userRoleId) {
      throw new Error('Admin or User role not found in the database');
    }
    
    const adminUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: adminUserId,  // Use the same UUID here
        sessionID: "",
        userName: 'admin',
        email: 'admin@dope.com',
        password: hashedPassword,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
    ], {});

    // Now create the user_roles associations
    await queryInterface.bulkInsert('user_roles', [
      {
        id: uuidv4(),
        userId: adminUserId,
        roleId: adminRoleId,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        id: uuidv4(),
        userId: adminUserId,
        roleId: userRoleId,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    const adminUser = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE "userName" = 'admin' AND email = 'admin@dope.com'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (adminUser.length > 0) {
      const adminUserId = adminUser[0].id;
      
      // Delete the user_roles entries
      await queryInterface.bulkDelete('user_roles', { userId: adminUserId });
      
      // Delete the admin user
      await queryInterface.bulkDelete('users', { id: adminUserId });
    }
  }
};