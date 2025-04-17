'use strict';
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint('devices', 'devices_serialNumber_key');
    } catch (error) {
      console.log('Constraint might not exist, continuing...');
    }

    const table = await queryInterface.describeTable('devices');

    // Only add the column if it doesn't exist
    if (!table.uniqueHash) {
      await queryInterface.addColumn('devices', 'uniqueHash', {
        type: Sequelize.CHAR(12),
        allowNull: true,
      });
    } else {
      console.log('Column "uniqueHash" already exists. Skipping addColumn.');
    }

    // Only populate rows that have null uniqueHash
    const [devices] = await queryInterface.sequelize.query(`
      SELECT id FROM devices WHERE "uniqueHash" IS NULL
    `);
    const usedHashes = new Set();

    for (const device of devices) {
      let uniqueHash;
      do {
        uniqueHash = crypto.randomBytes(6).toString('hex'); // 12-character
      } while (usedHashes.has(uniqueHash));
      usedHashes.add(uniqueHash);

      await queryInterface.sequelize.query(
        `UPDATE devices SET "uniqueHash" = :uniqueHash WHERE id = :id`,
        {
          replacements: { uniqueHash, id: device.id },
        }
      );
    }

    // Modify the column to be NOT NULL and UNIQUE
    await queryInterface.changeColumn('devices', 'uniqueHash', {
      type: Sequelize.CHAR(12),
      allowNull: false,
      unique: true, 
    });

    // Add the composite unique constraint if it doesn't exist
    try {
      await queryInterface.addConstraint('devices', {
        fields: ['userId', 'serialNumber'],
        type: 'unique',
        name: 'user_device_serial_unique'
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Composite unique constraint already exists. Skipping.');
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('devices', 'user_device_serial_unique');
    await queryInterface.removeColumn('devices', 'uniqueHash');
    await queryInterface.addConstraint('devices', {
      fields: ['serialNumber'],
      type: 'unique',
      name: 'devices_serialNumber_key'
    });
  }
};
