


// aws_secrets.js

// Description: This file contains functions to create, retrieve, and manage secrets in AWS Secrets Manager.
// It includes functions to create and retrieve secrets for InfluxDB and session management.
// It also includes functions to create Docker secrets from AWS Secrets Manager secrets.
//

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});
const path = require('path');
const fs = require('fs');
const crypto = require('crypto')
const { execSync } = require('child_process');

const { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { fromInstanceMetadata } = require("@aws-sdk/credential-providers");


const AWS_REGION = process.env.AWS_REGION;
const SESSIONSECRETS = process.env.SESSION_SECRETS;
const META_TIMEOUT = parseInt(process.env.META_TIMEOUT, 10) || 1000;
const META_RETRIES = process.env.META_RETRIES;
const MQTT_SECRETS = process.env.MQTT_SECRETS

const INFLUXDB_SECRETS = process.env.INFLUX_SECRETS;

const USERNAME = "Martin";
const PASSWORD = "password1234";
const ORG = "fitnessOrg";
const BUCKET = "fitBucket";


// Create a SecretsManagerClient instance with credentials from instance metadata
const client = new SecretsManagerClient({
  region: AWS_REGION,
  credentials: fromInstanceMetadata({
    timeout: META_TIMEOUT,
    maxRetries: META_RETRIES,
  }),
});



// Function to create a new secret in AWS Secrets Manager
async function createInfluxDBProdSecret(secretName,secretString) {

        // `{
        //   "username":"${userName}",
        //   "password":"${password}", 
        //   "apiKey":"${apiKey}", 
        //   "bucket":"${bucket}", 
        //   "organisation":"${organisation}"
        // }`


    const input = {
        Name: secretName,
        SecretString: secretString
    };
    const command = new CreateSecretCommand(input);
    try {
      await client.send(command);
    } catch (error) {
      console.error("Error creating secret:", error);
    }
}


async function getSecret(secretName) {

  const secret = { 
    SecretId: secretName
  };

  const command = new GetSecretValueCommand(secret);

  try {
    const response = await client.send(command);
    const secretData = JSON.parse(response.SecretString);
    return { success: true, data: secretData };
  } catch (error) {
    console.log("Error: ", error)
    return { success: false,  error: error }
  }
  
}

// Function to create a new session secret in AWS Secrets Manager
async function createSessionSecret() {
  let sessionSecret = crypto.randomBytes(48).toString('base64');

  const input = {
      Name: SESSIONSECRETS,
      SecretString: `{
      "sessionSecret":"${sessionSecret}"
      }`
  };

  const command = new CreateSecretCommand(input);

  try {
    await client.send(command);
    return {success: true, data: sessionSecret};
  } catch (error) {
    console.error("Error creating secret:", error);
    return {success: false, data: error};
  }

}


async function getSessionSecret(){
  const secret = { 
    SecretId: SESSIONSECRETS
  };

  const command = new GetSecretValueCommand(secret);

  try {
    const response = await client.send(command);
    const secretData = JSON.parse(response.SecretString);
    return { success: true, data: secretData };
  } catch (error) {
    console.log("Error: ", error)
    return { success: false,  error: error }
  }
}


function getInfluxDBDevSecrets(){

  let organisation = process.env.ORG;
  let bucket = process.env.BUCKET;
  let apiKey = process.env.API_KEY;

  if(organisation && bucket && apiKey){
    let secrets = {
      "organisation": organisation,
      "bucket": bucket,
      "apiKey": apiKey
    }
    
    return {success: true, data: secrets}

  }

  return {success: false, error: new Error("No secrets found")}

}

// Function to create a new secret in the development environment
async function createInfluxDBDevSecret(userName, password, apiKey, bucket, organisation) {
  const ENV_FILE_PATH = path.resolve(__dirname, envFile);
  
  userName = `\nUSERNAME=${userName}`;
  password = `\nPASSWORD=${password}`;
  apiKey = `\nAPI_KEY=${apiKey}`;
  bucket = `\nBUCKET=${bucket}`;
  organisation = `\nORG=${organisation}`;

  try {
    fs.appendFileSync(ENV_FILE_PATH, userName);
  } catch (err) {
    console.error(err);
  }

  try {
    fs.appendFileSync(ENV_FILE_PATH, password);
  } catch (err) {
    console.error(err);
  }

  try {
    fs.appendFileSync(ENV_FILE_PATH, bucket);
  } catch (err) {
    console.error(err);
  }

  try {
    fs.appendFileSync(ENV_FILE_PATH, organisation);
  } catch (err) {
    console.error(err);
  }

  try {
    fs.appendFileSync(ENV_FILE_PATH, apiKey);
  } catch (err) {
    console.error(err);
  }
}

// Function to create a new secret in the development environment
async function createDevSessionSecret() {
  const ENV_FILE_PATH = path.resolve(__dirname, envFile);
  let sessionSecret = crypto.randomBytes(48).toString('base64');
  
  let Secret = `\nSESSION_SECRET=${sessionSecret}`;

  


  try {
    fs.appendFileSync(ENV_FILE_PATH, Secret);
    console.log("Secret: ", Secret)
    return {success: true, data: Secret}
  } catch (err) {
    console.log("Ptho: ")
    return {success: false, data: err}
  }

}

function getDevSessionSecrets(){

  let sessionSecret = process.env.SESSION_SECRET;

  if(sessionSecret){
    return {success: true, data: sessionSecret}
  } else {
    return {success: false, data: new Error("No secret found")}
  }

}

function decodeBase64(base64String){
  return Buffer.from(base64String, 'base64').toString('utf-8');
}

function checkSecretExists(secretName) {
  try {
    const result = execSync('docker secret ls --format "{{.Name}}"', { encoding: 'utf-8' });
    const existingSecrets = result.split('\n').filter(Boolean);
    return existingSecrets.includes(secretName);
  } catch (error) {
    console.error('Error checking secret existence:', error);
    return false;
  }
}


async function createDockerSecrets() {
  const secrets = await getSecret(MQTT_SECRETS);
  
  // List of secrets that are base64 encoded
  const base64Secrets = ['ca_crt', 'ca_key', 'server_crt', 'server_key'];

  // Track created secrets for logging
  const createdSecrets = [];
  const skippedSecrets = [];

  if(!secrets.success){
    console.error("Error retrieving secrets from AWS Secrets Manager: ", secrets.error);
    return;
  }
  
  // Create Docker secrets
  for (const [key, value] of Object.entries(secrets.data)) {
    const secretName = `mqtt_${key}`;



    // Check if secret already exists
    if (checkSecretExists(secretName)) {
      skippedSecrets.push(secretName);
      continue;
    }

    const secretValue = base64Secrets.includes(key) ? decodeBase64(value) : value;
    const tempFile = `./${key}.temp`;



    
    try {
      // Write secret to temporary file
      fs.writeFileSync(tempFile, secretValue);
      
      // Create Docker secret
      execSync(`docker secret create ${secretName} ${tempFile}`);
      
      // Clean up temporary file
      fs.unlinkSync(tempFile);
      
      createdSecrets.push(secretName);
    } catch (error) {
      console.error(`Error creating Docker secret ${secretName}:`, error);
      // Clean up temp file if it exists
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }


  // Log summary
  if (createdSecrets.length > 0) {
    console.log('\nCreated new secrets:', createdSecrets.join(', '));
  }
  if (skippedSecrets.length > 0) {
    console.log('Skipped existing secrets:', skippedSecrets.join(', '));
  }
  if (createdSecrets.length === 0 && skippedSecrets.length === 0) {
    console.log('No secrets were processed');
  }

  return {
    created: createdSecrets,
    skipped: skippedSecrets
  };
}


async function retrieveSessionSecret(){

  let sessionSecret = null;

  if (env === 'production'){

    const sessionQuery = await getSessionSecret();

    if(sessionQuery.success){
      sessionSecret = sessionQuery.data.sessionSecret;
    } else {
      console.log("Unable to retrieve session secret");
      let response = await createSessionSecret();
      if(response.success){
        sessionSecret = response.data.sessionSecret;
      } else {
        throw new Error("Unable to retrieve session secret");
      }
    }

  } else if( env === 'development'){

    let sessionQuery = getDevSessionSecrets();

    if(sessionQuery.success){
      sessionSecret =  sessionQuery.data
    } else {
      let result = await createDevSessionSecret();
      if(result.success){
        sessionSecret = result.data
      } else {
        throw new Error("Unable to create dev session secret");
      }
    }

  }

  return sessionSecret;
}


async function retrieveInfluxDBSecrets() {
  if (env === 'production') {
    try {
      const influxdbSecrets = await getSecret(INFLUXDB_SECRETS);

      if (influxdbSecrets) {

        if (!influxdbSecrets?.success || !influxdbSecrets?.data) {
          throw new Error("Unable to retrieve InfluxDB secrets");
        }
  
        const { apiKey, organisation, bucket } = influxdbSecrets.data;
  
        if (!apiKey || !organisation || !bucket) {
          throw new Error("Incomplete InfluxDB secrets received");
        }

        return { apiKey, organisation, bucket };
      } else {
        let response = await setupInfluxDB(USERNAME, PASSWORD, ORG, BUCKET);
        await createInfluxDBProdSecret(USERNAME, PASSWORD, response.data, BUCKET, ORG);
        return { apiKey: response.data, organisation: ORG, bucket: BUCKET };
      }

    } catch (error) {
      console.error('Error retrieving InfluxDB secrets:', error);
      return null;
    }

  } else if (env === 'development') {
    const result = getInfluxDBDevSecrets();

    if (result?.success && result?.data) {
      const { apiKey, organisation, bucket } = result.data;

      if (!apiKey || !organisation || !bucket) {
        console.error('Incomplete InfluxDB secrets in development mode');
        return null;
      }

      return { apiKey, organisation, bucket };
    } else {
      console.error('Error retrieving InfluxDB secrets:', result?.error || 'Unknown error');
      // At this point, there are no previously stored secrets, so create new ones 
      console.log("Creating InfluxDB secrets");

      let response = await setupInfluxDB(USERNAME, PASSWORD, ORG, BUCKET);
      if(response?.success && response?.data){
        createInfluxDBDevSecret(USERNAME, PASSWORD, response.data, BUCKET, ORG);
        console.log("Onboarding success")
        return { apiKey: response.data, organisation: ORG, bucket: BUCKET };
      } else {
        console.log("Unable to get the API token");
        // throw new Error("Unable to retrieve API token");
        return null;
      }
    }
  }
}





module.exports = { 
  getSecret, 
  createInfluxDBProdSecret, 
  createInfluxDBDevSecret, 
  getInfluxDBDevSecrets,  
  getDevSessionSecrets, 
  retrieveSessionSecret,
  retrieveInfluxDBSecrets
};

// If running directly (not imported)
if (require.main === module) {
  createDockerSecrets().catch(console.error);
}

