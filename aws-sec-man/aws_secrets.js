const { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { fromInstanceMetadata } = require("@aws-sdk/credential-providers");


// Create a SecretsManagerClient instance with credentials from instance metadata
const client = new SecretsManagerClient({
  region: 'us-east-1',
  credentials: fromInstanceMetadata({
    timeout: 1000,
    maxRetries: 3,
  }),
});

// Function to create a new secret in AWS Secrets Manager
async function createSecret() {
    const input = {
        Name: "TestAPIToken",
        SecretString: "{\"username\":\"martin\",\"password\":\"martin1234\"}"
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

  // GetSecretValueRequest
  const secret = { 
    SecretId: "TestAPITokenw"
  };

  const command = new GetSecretValueCommand(secret);

  try {
    const response = await client.send(command);
    console.log(response)
  } catch (error) {
    console.error("Error retrieving secret:", error);
  }
  
}


module.exports = { getSecret, createSecret }


