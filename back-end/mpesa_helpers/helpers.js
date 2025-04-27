
const axios = require('axios');

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? './.env' : `./.env.${env}`;
require('dotenv').config({path: envFile});

// Load environment variables
const authAPI = process.env.MPESA_AUTH_API;
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortCode = process.env.MPESA_SHORT_CODE;
const passKey = process.env.MPESA_PASSKEY;
const callbackURL = process.env.MPESA_CALLBACK_URL;
const processRequestURL = process.env.MPESA_PROCESS_REQUEST_URL;

// Helper function to get the timestamp in YYYYMMDDHHmmss format
const getTimestamp = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Helper function to get OAuth token
const getAccessToken = async () => {
    try {
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const response = await axios.get(authAPI, {
            headers: {
                'Authorization': `Basic ${auth}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching auth token:', error);
        throw new Error('Failed to fetch auth token');
    }
};

// Helper function to generate password
const getPassword = (timestamp) => {
    return Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');
};

// Helper function to get short code
const getShortCode = () => {
    return shortCode
};

// Helper function to get callback URL
const getCallbackURL = () => {
    return callbackURL;
};

// Helper function to process request URL
const getProcessRequestURL = () => {
    return processRequestURL;
};


module.exports = { 
    getTimestamp, 
    getPassword, 
    getAccessToken, 
    getShortCode, 
    getCallbackURL,
    getProcessRequestURL
};