const path = require('path');  // Import the path module
const ENV_FILE_PATH = path.resolve(__dirname, '../.env');

const dotenv = require('dotenv');
dotenv.config({ path: ENV_FILE_PATH});

const axios = require('axios');
const fs = require('fs');


const API_TOKEN_ENV_VAR = 'INFLUXDB_API_TOKEN';
console.log("File path : " + ENV_FILE_PATH);


const adminUsername = process.env.ADMIN_USERNAME;
const influxBaseURL =  process.env.INFLUXDB_HOST || 'http://localhost:8086';
const adminPassword = process.env.ADMIN_PASSWORD;
const org = process.env.ORG_NAME;
const bucket = process.env.BUCKET_NAME;

console.log(adminUsername)
console.log(adminPassword)
console.log(org)
console.log(bucket)

async function setupInfluxDB() {
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
                {
                    action: 'read',
                    resource: { type: 'buckets' }
                },
                {
                    action: 'write',
                    resource: { type: 'buckets' }
                }
            ],
            description: "Regular user token"
        }, {
            headers: {
                'Authorization': `Token ${setupResponse.data.auth.token}`
            }
        });

        const apiToken = tokenResponse.data.token;
        console.log('API Token:', apiToken);
        fs.appendFileSync(ENV_FILE_PATH, `\n${API_TOKEN_ENV_VAR}=${apiToken}\n`);
        dotenv.config({ path: ENV_FILE_PATH});

    } catch (error) {
        console.error('Error setting up InfluxDB:', error.response ? error.response.data : error.message);
    }
}


module.exports = { setupInfluxDB }