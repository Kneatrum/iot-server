'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      
      User.hasOne(models.Dashboard,{
        foreignKey: "userId", 
        as: "dashboard"
      });

      User.hasMany(models.Topic,{
        foreignKey: "userId", 
        as: 'topics'
      });

    }

    toJSON(){
      return { ...this.get(), id: undefined }
    }
    
  }

  User.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }, 
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "users",
    modelName: 'User',
  });

  return User;
};
