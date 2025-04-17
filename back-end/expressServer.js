

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? './.env' : `./.env.${env}`;
require('dotenv').config({path: envFile});

const cors = require('cors');
const express = require('express');
const session = require('express-session');

const general_routes = require('./router/general.js').general;
const user_routes = require('./router/users.js').users;
const sslServicesRoutes = require('./router/ssl-services.js');

const {  getSessionStore, sessionStoreReady } = require('./databases/postgres/sessionManager.js');
const { retrieveSessionSecret } = require('./secrets/aws_secrets.js');

const frontEndHost = process.env.FRONTEND_HOST || 'http://localhost';
const HOST_URL =  process.env.HOST_URL || 'http://localhost'


const allowedOrigins = [
    frontEndHost,
    HOST_URL,
    'https://dopesilicon.com',
    'https://www.dopesilicon.com',
  ];

async function createApp() {
    await sessionStoreReady;
    const sessionStore = getSessionStore();
    if (!sessionStore) {
      throw new Error('Session store is not ready');
    }
  
    const sessionSecret = await retrieveSessionSecret();
    if (!sessionSecret) {
      throw new Error('Session secret is not ready');
    }

    const app = express();
    app.use(express.json());

    app.use(cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }));

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'Server is running' });
    });

    // Set up session middleware
    app.use(
        session({
            secret: sessionSecret,
            store: sessionStore,
            saveUninitialized: false,
            resave: false,
            cookie: {
                maxAge: 60000 * 60,
                secure: env === 'production', // Use secure cookies in production
                sameSite: 'strict'
            },
        })
    );

    app.use("/", general_routes);
    app.use("/users", user_routes);
    app.use("/ssl-services", sslServicesRoutes);
    
    app.set('trust proxy', true);

    return app;
}

module.exports = createApp;  // Export the app for testing purposes