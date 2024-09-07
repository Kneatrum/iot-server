const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});


const axios = require('axios');

const influxBaseURL =  process.env.INFLUXDB_HOST || 'http://localhost:8086';

const setupInfluxDB = async (adminUsername, adminPassword, org, bucket) => {
    try {
        // Step 1: Set up the initial admin user, org, and bucket
        const setupResponse = await axios.post(`${influxBaseURL}/api/v2/setup`, {
            username: adminUsername,
            password: adminPassword,
            org: org,
            bucket: bucket,
            retentionRules: [{
                type: 'expire',
                everySeconds: 0  // Retention policy (0 means infinite)
            }]
        });

        console.log('Setup Response:', setupResponse.data);

        // Step 2: Generate an API token
        const tokenResponse = await axios.post(`${influxBaseURL}/api/v2/authorizations`, {
            orgID: setupResponse.data.org.id,
            permissions: [
                { action: 'read', resource: { type: 'buckets' } },
                { action: 'write', resource: { type: 'buckets' } }
            ],
            description: "Regular user token"
        }, {
            headers: { 'Authorization': `Token ${setupResponse.data.auth.token}` }
        });

        return {success: true, data: tokenResponse.data.token};
        
    } catch (error) {
        console.error('Error setting up InfluxDB:', error.response ? error.response.data : error.message);
        return { success: false, error: error }
    }
};



module.exports = { setupInfluxDB }