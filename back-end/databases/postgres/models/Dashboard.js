'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dashboard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Dashboard.belongsTo(models.User, {
        foreignKey: 'userId', 
        as: 'user' 
      });

      Dashboard.hasMany(models.Chart, { 
        foreignKey: 'dashboardId', 
        as: 'charts' 
      });

    }
  }

  Dashboard.init({
    layout: {
      type: DataTypes.JSONB
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
  }, {
    sequelize,
    tableName: "dashboards",
    modelName: 'Dashboard',
  });

  return Dashboard;
};