'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const { getSecret } = require('../../../secrets/aws_secrets.js');

const POSTGRESDB_SECRETS = process.env.POSTGRES_SECRETS;
const POSTGRES_HOSTNAME = process.env.POSTGRES_HOST;
const DIALECT = process.env.POSTGRES_DIALECT || 'postgres';
const POSTGRES_LOGGING = process.env.POSTGRES_LOGGING === 'true';

const db = {};
let sequelize = null;

async function init() {
  try {
    if (env === 'production') {
      const postgresDBConfig = await getSecret(POSTGRESDB_SECRETS);
      
      if (!postgresDBConfig || !postgresDBConfig.success) {
        throw new Error("Failed to retrieve PostgreSQL secrets from AWS");
      }
      
      sequelize = new Sequelize(
        postgresDBConfig.data.databaseName,
        postgresDBConfig.data.userName,
        postgresDBConfig.data.password,
        {
          host: POSTGRES_HOSTNAME,
          dialect: DIALECT,
          logging: POSTGRES_LOGGING,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
          }
        }
      );
    } else {
      const config = require(__dirname + '/../config/config.json')[env];
      if (config.use_env_variable) {
        sequelize = new Sequelize(process.env[config.use_env_variable], config);
      } else {
        sequelize = new Sequelize(
          config.database,
          config.username,
          config.password,
          config
        );
      }
    }

    // Load models
    const modelFiles = fs.readdirSync(__dirname).filter(file =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.endsWith('.js') &&
      !file.includes('.test.js')
    );

    for (const file of modelFiles) {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    }

    // Associate models
    for (const modelName of Object.keys(db)) {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    }

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    console.log('Models loaded:', Object.keys(db)); // Debugging model loading

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Ensure models are initialized before export
module.exports = {
  init,
  getModels: async () => {
    if (!sequelize) {
      await init();
    }
    return db;
  }
};
