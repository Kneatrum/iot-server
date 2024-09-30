'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Topic.belongsTo(models.User,{
        foreignKey: "userId", 
        as: 'user'
      })

      Topic.belongsToMany(models.Chart, { 
        through: 'TopicCharts', 
        foreignKey: 'topicId', 
        otherKey: 'chartId',
        as: 'charts', 
      });

    }

    toJSON(){
      return { ...this.get(), id: undefined }
    }
  }

  Topic.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
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
    name: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    tableName: "topics",
    modelName: 'Topic',
  });

  return Topic;
};