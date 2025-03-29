'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chart extends Model {
    static associate(models) {

      Chart.belongsTo(models.Layout, {
        foreignKey: 'layoutId', 
        as: 'layout' 
      });

      Chart.hasMany(models.Topic, {
        foreignKey: "chartId",
        as: 'topics',
        onDelete: 'CASCADE',   // If a chart is deleted, delete associated topics
        onUpdate: 'CASCADE'
      });
      
    }

    // toJSON() {
    //   return { ...this.get(), id: undefined };
    // }

  }

  Chart.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    layoutId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'layouts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    chartType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    dateSpan: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "charts",
    modelName: 'Chart',
  });

  return Chart;
};