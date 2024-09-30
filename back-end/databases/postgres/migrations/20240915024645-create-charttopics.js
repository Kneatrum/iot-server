'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, DataTypes) {
    await queryInterface.createTable('ChartTopics', { 
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    chartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'charts', 
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'topics', 
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.fn('now')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.fn('now')
    }
    });

    // Add a unique constraint to prevent duplicate associations
    await queryInterface.addConstraint('ChartTopics', {
      fields: ['chartId', 'topicId'],
      type: 'unique',
      name: 'unique_chart_topic'
    });

  },

  async down (queryInterface, DataTypes) {
    await queryInterface.dropTable('ChartTopics');
  }
};
