require('dotenv').config({path: '../.env'});

const { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { fromInstanceMetadata } = require("@aws-sdk/credential-providers");


const AWS_REGION = process.env.AWS_REGION;
const SECRETS = process.env.SECRETS;
const META_TIMEOUT = process.env.META_TIMEOUT;
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
        "username":${userName},
        "password":${password}, 
        "apiKey":${apiKey}, 
        "bucket":${bucket}, 
        "organisation":${organisation}
        }`
        // SecretString: "{\"username\":\"martin\",\"password\":\"martin1234\"}"
    };
    const command = new CreateSecretCommand(input);
    try {
        const response = await client.send(command);
        console.log(response);
    } catch (error) {
        console.error("Error creating secret:", error);
    }
}


async function getSecret() {

    let response = null;
  const secret = { 
    SecretId: SECRETS
  };

  const command = new GetSecretValueCommand(secret);

  try {
    response = await client.send(command);
    return response;
  } catch (error) {
    if (error.__type === 'ResourceNotFoundException') {
        console.error("Secret not found:", error);
    } else {
        console.error("Error retrieving secret:", error);
    }
    return response;
  }
  
}


module.exports = { getSecret, createSecret };



