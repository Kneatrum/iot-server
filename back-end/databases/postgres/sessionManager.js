const { databaseinitialized, sequelize }   = require('./models/index');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);


let sessionStore = null;

const sessionStoreReady = (async () => {
    try {
        await databaseinitialized;


        await sequelize.authenticate();
        console.log('Connected to PostgreSQL database');

        sessionStore = new SequelizeStore({
            db: sequelize,
            checkExpirationInterval: 15 * 60 * 1000, // 15 Minutes
            expiration: 24 * 60 * 60 * 1000 // 24 Hours
        });

        // await sequelize.sync();
        await sessionStore.sync();

        console.log('Session store is ready');
        return sessionStore;

    } catch (error) {
        console.error('Error initializing session store:', error);
        return null;
    }
})();

module.exports = {
    getSessionStore: () => sessionStore,
    sessionStoreReady,  // await this promise before using getSessionStore()
};

