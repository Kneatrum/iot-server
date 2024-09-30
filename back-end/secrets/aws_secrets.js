const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});
const path = require('path');
const fs = require('fs');
const crypto = require('crypto')

const { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { fromInstanceMetadata } = require("@aws-sdk/credential-providers");


const AWS_REGION = process.env.AWS_REGION;
const SECRETS = process.env.SECRETS;
const SESSIONSECRETS = process.env.SESSION_SECRETS;
const META_TIMEOUT = parseInt(process.env.META_TIMEOUT, 10) || 1000;
const META_RETRIES = process.env.META_RETRIES;


// Create a SecretsManagerClient instance with credentials from instance metadata
const client = new SecretsManagerClient({
  region: AWS_REGION,
  credentials: fromInstanceMetadata({
    timeout: META_TIMEOUT,
    maxRetries: META_RETRIES,
  }),
});



// Function to create a new secret in AWS Secrets Manager
async function createSecret(userName, password, apiKey, bucket, organisation) {
    const input = {
        Name: SECRETS,
        SecretString: `{
        "username":"${userName}",
        "password":"${password}", 
        "apiKey":"${apiKey}", 
        "bucket":"${bucket}", 
        "organisation":"${organisation}"
        }`
    };
    const command = new CreateSecretCommand(input);
    try {
      await client.send(command);
    } catch (error) {
      console.error("Error creating secret:", error);
    }
}


async function getSecret() {

  const secret = { 
    SecretId: SECRETS
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


function getDevSecrets(){

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
async function createDevSecret(userName, password, apiKey, bucket, organisation) {
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

module.exports = { getSecret, createSecret, createDevSecret, getDevSecrets, createSessionSecret, getSessionSecret, createDevSessionSecret, getDevSessionSecrets};



