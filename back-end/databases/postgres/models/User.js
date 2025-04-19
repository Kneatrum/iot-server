'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      
      User.hasMany(models.Device, { foreignKey: "userId", as: 'devices'});
      User.belongsTo(models.Plan, { foreignKey: "planId" });
      User.belongsToMany(models.Role, { through: "user_roles", foreignKey: "userId", otherKey: "roleId"})

    }

    // toJSON(){
    //   return { ...this.get(), id: undefined }
    // }
    
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    sessionID: {
      type: DataTypes.STRING
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
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Plan',
        key: 'id'
      }
    },
    planStartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    planEndDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "users",
    modelName: 'User',
    timestamps: true
  });

  return User;
};
