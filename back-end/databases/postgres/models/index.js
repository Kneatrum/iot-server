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
      console.log('Fetching PostgreSQL credentials from AWS Secrets Manager...');
      const postgresDBConfig = await getSecret(POSTGRESDB_SECRETS);
      
      if (!postgresDBConfig || !postgresDBConfig.success) {
        throw new Error("Failed to retrieve PostgreSQL secrets from AWS");
      }

      console.log('Successfully retrieved database credentials');
      
      // Create Sequelize instance with AWS credentials
      sequelize = new Sequelize(
        postgresDBConfig.data.database,
        postgresDBConfig.data.username,
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
      // Development environment
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
    fs.readdirSync(__dirname)
      .filter(file => (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      ))
      .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
      });

    // Associate models
    Object.keys(db).forEach(modelName => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = { init, sequelize: db.sequelize };