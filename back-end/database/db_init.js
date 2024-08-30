const path = require('path');  // Import the path module
const ENV_FILE_PATH = path.resolve(__dirname, '../.env');

const dotenv = require('dotenv');
dotenv.config({ path: ENV_FILE_PATH});

const axios = require('axios');
const fs = require('fs').promises; // Use the promise-based fs API

const ADMIN_USERNAME = 'Martin Mwiti';
const ADMIN_PASSWORD = 'password1234';
const ORGANISATION = 'Fitness';
const BUCKET = 'fitnessbucket';


console.log("File path : " + ENV_FILE_PATH);


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

        const apiToken = tokenResponse.data.token;
        const apiTokenPath = process.env.INFLUXDB_API_TOKEN_FILE;
        const usernamePath = process.env.ADMIN_USERNAME_FILE;
        const passwordPath = process.env.ADMIN_PASSWORD_FILE;
        const orgNamePath = process.env.INFLUXDB_ORGANISATION;
        const bucketNamePath = process.env.INFLUXDB_BUCKET;

        // Ensure directories exist and write the files
        await Promise.all([apiTokenPath, usernamePath, passwordPath, orgNamePath, bucketNamePath].map(async (filePath) => {
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            if (filePath === apiTokenPath) await fs.writeFile(filePath, apiToken);
            else if (filePath === usernamePath) await fs.writeFile(filePath, adminUsername);
            else if (filePath === passwordPath) await fs.writeFile(filePath, adminPassword);
            else if (filePath === orgNamePath) await fs.writeFile(filePath, org);
            else if (filePath === bucketNamePath) await fs.writeFile(filePath, bucket);
        }));

    } catch (error) {
        console.error('Error setting up InfluxDB:', error.response ? error.response.data : error.message);
    }
};

const initializeFiles = async (adminUsername, adminPassword, org, bucket) => {
    const apiTokenPath = process.env.INFLUXDB_API_TOKEN_FILE;
    const orgNamePath = process.env.INFLUXDB_ORGANISATION;
    const bucketNamePath = process.env.INFLUXDB_BUCKET;

    // Check if the files exist, otherwise set them up
    if (!await fileExists(apiTokenPath) || !await fileExists(orgNamePath) || !await fileExists(bucketNamePath)) {
        console.log('API Token, Organization, or Bucket not found, generating new ones...');
        await setupInfluxDB(adminUsername, adminPassword, org, bucket);
    }
};

// Utility function to check if a file exists
const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

const startApp = async () => {
    try {
        await initializeFiles(ADMIN_USERNAME, ADMIN_PASSWORD, ORGANISATION, BUCKET);
    } catch (error) {
        console.error('Error during initialization:', error);
    }
};

startApp();

