const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});

const { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { fromInstanceMetadata } = require("@aws-sdk/credential-providers");


const AWS_REGION = process.env.AWS_REGION;
const SECRETS = process.env.SECRETS;
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


function getDevSecrets(){

  let username = process.env.USERNAME;
  let password = process.env.PASSWORD;
  let organisation = process.env.ORG;
  let bucket = process.env.BUCKET;
  let apiKey = process.env.API_KEY;

  if(username && password && organisation && bucket && apiKey){
    let secrets = {
      "organisation": organisation,
      "bucket": bucket,
      "apiKey": apiKey
    }
    
    return {success: true, data: secrets}

  }

  return {success: false, error: new Error("No secrets found")}

}

// Function to create a new secret in AWS Secrets Manager
async function createDevSecret(userName, password, apiKey, bucket, organisation) {
  const ENV_FILE_PATH = path.resolve(__dirname, envFile);
  
  const fs = require('fs');
  userName = `USERNAME=${userName}`;
  password = `PASSWORD=${password}`;
  apiKey = `API_KEY=${apiKey}`;
  bucket = `BUCKET=${bucket}`;
  organisation = `ORG=${organisation}`;

  try {
    fs.writeFileSync(ENV_FILE_PATH, userName);
    fs.writeFileSync(ENV_FILE_PATH, password);
    fs.writeFileSync(ENV_FILE_PATH, apiKey);
    fs.writeFileSync(ENV_FILE_PATH, bucket);
    fs.writeFileSync(ENV_FILE_PATH, organisation);

    console.log('File written successfully');
  } catch (err) {
    console.error(err);
  }


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

module.exports = { getSecret, createSecret, createDevSecret, getDevSecrets };



