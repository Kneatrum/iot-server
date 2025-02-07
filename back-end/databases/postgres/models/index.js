'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const { getSecret } = require('../../../secrets/aws_secrets.js');
const db = {};

const POSTGRESDB_SECRETS = process.env.POSTGRES_SECRETS;
const POSTGRES_HOSTNAME = process.env.POSTGRES_HOST;
const DIALECT = process.env.POSTGRES_DIALECT;
const POSTGRES_LOGGING = process.env.POSTGRES_LOGGING;

async function initializeDB() {
  let sequelize;
  
  if (env === 'production') {
    try {
      const postgresDBConfig = await getSecret(POSTGRESDB_SECRETS);
      
      if (postgresDBConfig.success) {
        sequelize = new Sequelize(
          postgresDBConfig.data.databaseName,
          postgresDBConfig.data.username,
          postgresDBConfig.data.password,
          {
            host: POSTGRES_HOSTNAME,
            dialect: DIALECT,
            logging: POSTGRES_LOGGING
          }
        );
      } else {
        throw new Error("Failed to get Postgres secrets in production: " + postgresDBConfig.error);
      }
    } catch (error) {
      throw new Error("Failed to initialize Sequelize in production: " + error);
    }
  } else {
    if (config.use_env_variable) {
      sequelize = new Sequelize(process.env[config.use_env_variable], config);
    } else {
      sequelize = new Sequelize(config.database, config.username, config.password, config);
    }
  }

  // Load models
  fs.readdirSync(__dirname)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      );
    })
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    });

  // Set up associations
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
}

module.exports = { initializeDB };