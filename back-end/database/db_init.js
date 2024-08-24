const path = require('path');  // Import the path module
const ENV_FILE_PATH = path.resolve(__dirname, '../.env');

const dotenv = require('dotenv');
dotenv.config({ path: ENV_FILE_PATH});

const axios = require('axios');
const fs = require('fs');


console.log("File path : " + ENV_FILE_PATH);


const influxBaseURL =  process.env.INFLUXDB_HOST || 'http://localhost:8086';


async function setupInfluxDB(adminUsername, adminPassword, org, bucket) {
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
        const apiTokenPath = process.env.INFLUXDB_API_TOKEN_FILE;
        const usernamePath = process.env.ADMIN_USERNAME_FILE
        const passwordPath = process.env.ADMIN_PASSWORD_FILE
        
         // Write the new token to the secret file
         fs.writeFileSync(apiTokenPath, apiToken);
         fs.writeFileSync(usernamePath, username);
         fs.writeFileSync(passwordPath, password);
         console.log(`API Token written to ${apiTokenPath}`);

    } catch (error) {
        console.error('Error setting up InfluxDB:', error.response ? error.response.data : error.message);
    }

    setupInfluxDB().catch(console.error);

}


module.exports = { setupInfluxDB }