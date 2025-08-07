const { databaseinitialized, sequelize } = require('./models/index');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

let sessionStore = null;

const sessionStoreReady = (async () => {
    try {
        await databaseinitialized;
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL database');
        
        const store = new SequelizeStore({
            db: sequelize,
            checkExpirationInterval: 15 * 60 * 1000, // 15 Minutes
            expiration: 24 * 60 * 60 * 1000 // 24 Hours
        });
        
        await store.sync();
        
        // Assign to the module variable
        sessionStore = store;
        
        console.log('Session store is ready');
        return sessionStore;
    } catch (error) {
        console.error('Error initializing session store:', error);
        sessionStore = null; // Explicitly set to null on error
        throw error; // Re-throw the error instead of returning null
    }
})();

module.exports = {
    getSessionStore: () => sessionStore,
    sessionStoreReady,
};