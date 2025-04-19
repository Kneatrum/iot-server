'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
  
    static associate(models) {
      Role.belongsToMany(models.User, { through: "user_roles", foreignKey: "roleId", otherKey: "userId"});
    }

    // toJSON(){
    //   return { ...this.get(), id: undefined }
    // }

  }

  Role.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    permissions: {
        type: DataTypes.JSONB,
        allowNull: false
    }
  }, {
    sequelize,
    tableName: "roles",
    modelName: 'Role',
  });

  return Role;
};