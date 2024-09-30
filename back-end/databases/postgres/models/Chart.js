'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chart extends Model {
    static associate(models) {
      Chart.belongsTo(models.Dashboard, {
        foreignKey: 'dashboardsId', 
        as: 'dashboards' 
      });

      Chart.belongsToMany(models.Topic, {
        through: 'ChartTopics', 
        as: 'topics', 
        foreignKey: 'chartId', 
        otherKey: 'topicId' 
      });
    }

    toJSON() {
      return { ...this.get(), id: undefined };
    }

  }

  Chart.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    dashboardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dashboards',
        key: 'id'
      }
    },
    chartType: {
      type: DataTypes.STRING
    },
    config: {
      type: DataTypes.JSONB
    },
    dateSpan: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    tableName: "charts",
    modelName: 'Chart',
  });

  return Chart;
};