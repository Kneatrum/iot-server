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
const AWS_SECRETS = process.env.AWS_SECRETS

const db = {};
let sequelize;

// Sync wrapper
function loadModels(sequelizeInstance) {
  const modelFiles = fs.readdirSync(__dirname).filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.endsWith('.js') &&
    !file.includes('.test.js')
  );

  for (const file of modelFiles) {
    const model = require(path.join(__dirname, file))(sequelizeInstance, Sequelize.DataTypes);
    db[model.name] = model;
  }

  // Set associations
  for (const modelName of Object.keys(db)) {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  }
}

async function initializeDatabase() {
  if (env === 'production') {
    const results = await getSecret(AWS_SECRETS);

    if (!results || !results.success) {
      throw new Error("Failed to retrieve PostgreSQL secrets from AWS");
    }

    sequelize = new Sequelize(
      results.data.databaseName,
      results.data.databaseUserName,
      results.data.databasePassword,
      {
        host: results.data.databaseHost,
        dialect: DIALECT,
        logging: POSTGRES_LOGGING,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );
  } else {
    const config = require(__dirname + '/../config/config.json')[env];
    if (config.use_env_variable) {
      sequelize = new Sequelize(process.env[config.use_env_variable], config);
    } else {
      sequelize = new Sequelize(config.database, config.username, config.password, config);
    }
  }

  loadModels(sequelize);

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
}

const databaseinitialized = initializeDatabase()
  .then(() => db)
  .catch(err => {
    console.error('Failed to initialize database:', err);
    throw err;
  });

module.exports = {
  databaseinitialized, // export the promise for setup
  db,          // allows synchronous access *after* await initialized
  sequelize    // optional if you want to access just sequelize
};
