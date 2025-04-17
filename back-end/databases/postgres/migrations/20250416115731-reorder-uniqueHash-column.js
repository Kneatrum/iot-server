'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove foreign key constraints safely
    try {
      await queryInterface.removeConstraint('layouts', 'layouts_deviceId_fkey');
    } catch (error) {
      console.warn('layouts_deviceId_fkey constraint not found. Continuing...');
    }

    try {
      await queryInterface.removeConstraint('topics', 'topics_deviceId_fkey');
    } catch (error) {
      console.warn('topics_deviceId_fkey constraint not found. Continuing...');
    }

    // 2. Drop temp table if it exists (in case of failed runs)
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS "devices_temp";
    `);

    // 3. Create new devices_temp table with reordered columns
    await queryInterface.createTable('devices_temp', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      uniqueHash: {
        type: Sequelize.CHAR(12),
        allowNull: false,
        unique: true
      },
      deviceName: {
        type: Sequelize.STRING
      },
      serialNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      activeStatus: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 4. Copy data into new table with generated uniqueHash
    await queryInterface.sequelize.query(`
      INSERT INTO "devices_temp" (
        "id", "userId", "uniqueHash", "deviceName", "serialNumber", "activeStatus", "createdAt", "updatedAt"
      )
      SELECT 
        "id", "userId", substring(md5(random()::text), 1, 12), 
        "deviceName", "serialNumber", "activeStatus", "createdAt", "updatedAt"
      FROM "devices";
    `);

    // 5. Drop old table and rename new one
    await queryInterface.dropTable('devices');
    await queryInterface.renameTable('devices_temp', 'devices');

    // 6. Recreate foreign key constraints
    await queryInterface.addConstraint('layouts', {
      fields: ['deviceId'],
      type: 'foreign key',
      name: 'layouts_deviceId_fkey',
      references: {
        table: 'devices',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('topics', {
      fields: ['deviceId'],
      type: 'foreign key',
      name: 'topics_deviceId_fkey',
      references: {
        table: 'devices',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // 7. Add composite unique constraint
    await queryInterface.addConstraint('devices', {
      fields: ['userId', 'serialNumber'],
      type: 'unique',
      name: 'user_device_serial_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint('layouts', 'layouts_deviceId_fkey');
    } catch (error) {
      console.warn('layouts_deviceId_fkey constraint not found. Continuing...');
    }

    try {
      await queryInterface.removeConstraint('topics', 'topics_deviceId_fkey');
    } catch (error) {
      console.warn('topics_deviceId_fkey constraint not found. Continuing...');
    }

    await queryInterface.createTable('devices_original', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      deviceName: {
        type: Sequelize.STRING
      },
      serialNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      activeStatus: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.sequelize.query(`
      INSERT INTO "devices_original" (
        "id", "userId", "deviceName", "serialNumber", "activeStatus", "createdAt", "updatedAt"
      )
      SELECT 
        "id", "userId", "deviceName", "serialNumber", "activeStatus", "createdAt", "updatedAt"
      FROM "devices";
    `);

    await queryInterface.dropTable('devices');
    await queryInterface.renameTable('devices_original', 'devices');

    await queryInterface.addConstraint('layouts', {
      fields: ['deviceId'],
      type: 'foreign key',
      name: 'layouts_deviceId_fkey',
      references: {
        table: 'devices',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('topics', {
      fields: ['deviceId'],
      type: 'foreign key',
      name: 'topics_deviceId_fkey',
      references: {
        table: 'devices',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('devices', {
      fields: ['serialNumber'],
      type: 'unique',
      name: 'devices_serialNumber_key'
    });
  }
};
