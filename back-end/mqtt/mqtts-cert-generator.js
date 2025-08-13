const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});

const pem = require("pem");
const fs = require("fs");
const path = require("path");

const DOCKER_SECRET_PATH = process.env.DOCKER_SECRET_PATH;
const AWS_SECRETS = process.env.AWS_SECRETS;
const { getSecret } = require('../secrets/aws_secrets.js');

// Cache for credentials to avoid multiple API calls
let credentialsCache = null;

function readDockerSecret(secretName) {
  try {
    const secretPath = `${DOCKER_SECRET_PATH.replace(/\/?$/, '/')}${secretName}`;
      if (fs.existsSync(secretPath)) {
          return fs.readFileSync(secretPath, "utf8").trim();
      } else {
          console.warn(`Secret "${secretName}" not found.`);
          console.warn(`Path is: "${secretPath}"`);
          return null;
      }
  } catch (error) {
      console.error(`Error reading secret "${secretName}":`, error.message);
      return null;
  }
}

// Function to get credentials based on environment
async function getCredentials() {
  // Return cached credentials if already loaded
  if (credentialsCache) {
    return credentialsCache;
  }

  if (env === 'production') {
    // Read from Docker secrets
    try {
      const results = await getSecret(AWS_SECRETS);

      if (!results || !results.success) {
        console.error("Failed to retrieve AWS secrets:", results);
        throw new Error("Failed to retrieve AWS secrets");
      }
      console.log("Successfully retrieved AWS secrets for MQTT certificates");
      const { 
        caCert: mqtt_ca_crt, 
        caKey: mqtt_ca_key, 
        caPassword : mqtt_ca_password, 
        clientCsrSubject: mqtt_client_csr_subject, 
      } = results.data.mqtt_certs;


      console.log("caCert:", caCert);
      console.log("caKey:", caKey);
      console.log("caPassword:", caPassword);
      console.log("clientCsrSubject:", clientCsrSubject);

      console.log("mqtt_client_csr_subject:", mqtt_client_csr_subject);
      console.log("mqtt_ca_crt:", mqtt_ca_crt);
      console.log("mqtt_ca_key:", mqtt_ca_key);
      console.log("mqtt_ca_password:", mqtt_ca_password);



      if (!caCert || !caKey || !caPassword || !clientCsrSubject) {
        console.log("Missing required secrets for MQTT certificate generation");
        throw new Error("Missing required secrets for MQTT certificate generation");
      }

      credentialsCache = {
        caCert,
        caKey,
        caPassword,
        clientCsrSubject
      };

      return credentialsCache;
    } catch (error) {
      console.error('Error reading Docker secrets:', error);
      throw error;
    }
  } else {
    // Read from environment variables and files
    try {
      credentialsCache = {
        caCert: fs.readFileSync(path.join(__dirname, '../../mosquitto/certs/ca.crt'), 'utf8'),
        caKey: fs.readFileSync(path.join(__dirname, '../../mosquitto/certs/ca.key'), 'utf8'),
        caPassword: process.env.CA_PASSWORD,
        clientCsrSubject: process.env.CLIENT_CSR_SUBJECT
      };

      return credentialsCache;
    } catch (error) {
      console.error('Error reading local certificates:', error);
      throw error;
    }
  }
}

function parseCsrSubject(csrSubject) {
  const fields = csrSubject.split('/').filter(Boolean);
  const subjectObject = {};
  fields.forEach(field => {
    const [key, value] = field.split('=');
    subjectObject[key] = value;
  });
  return subjectObject;
}

function constructCsrSubject(subjectObject) {
  return Object.entries(subjectObject)
    .map(([key, value]) => `/${key}=${value}`)
    .join('');
}

function updateSubjectObject(subject, updates) {
  return { ...subject, ...Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value != null)
  )};
}

async function generateClientPrivateKey() {
  return new Promise((resolve, reject) => {
    pem.createPrivateKey(2048, (err, key) => {
      if (err) return reject(err);
      resolve({clientPrivateKey: key});
    });
  });
}

async function generateClientCSR(subjectDetails, clientPrivateKey) {
  return new Promise((resolve, reject) => {
    pem.createCSR(
      {
        key: clientPrivateKey,
        commonName: subjectDetails.CN,
        country: subjectDetails.C,
        state: subjectDetails.ST,
        locality: subjectDetails.L,
        organization: subjectDetails.O,
        organizationUnit: subjectDetails.OU,
        emailAddress: "",
        challengePassword: "",
      },
      (err, csr) => {
        if (err) return reject(err);
        resolve({ clientCSR: csr});
      }
    );
  });
}

async function signClientCSR(clientCertificateSigningRequest, deviceSerialNumber, credentials) {
  return new Promise((resolve, reject) => {
    pem.createCertificate(
      {
        serviceCertificate: credentials.caCert,
        serviceKey: credentials.caKey,
        csr: clientCertificateSigningRequest,
        serviceKeyPassword: credentials.caPassword,
        serial: deviceSerialNumber,
        days: 360,
      },
      (err, cert) => {
        if (err) return reject(err);
        resolve({ signedCert: cert.certificate});
      }
    );
  });
}

async function generateCertificates({
  country = null,
  state = null,
  locality = null,
  organization = null,
  organizationUnit = null,
  serialNumber = null,
}) {
  try {
    // Load credentials when needed
    const credentials = await getCredentials();

    const tempSubjectObject = updateSubjectObject(parseCsrSubject(credentials.clientCsrSubject), {
      C: country,
      ST: state,
      L: locality,
      O: organization,
      OU: organizationUnit,
      CN: serialNumber,
    });

    const subjectObject = constructCsrSubject(tempSubjectObject);

    if (process.env.DEBUG_MODE === 'true') {
      console.log('Updated Subject Object:', tempSubjectObject);
      console.log('Modified CSR Subject:', subjectObject);
    }

    const { clientPrivateKey } = await generateClientPrivateKey();

    const { clientCSR } = await generateClientCSR(tempSubjectObject, clientPrivateKey.key);

    const { signedCert: clientCertificate } = await signClientCSR(
      clientCSR.csr,
      tempSubjectObject.CN,
      credentials
    );

    return {
      status: 'success',
      data: {
        privateKey: clientPrivateKey.key,
        caCert: credentials.caCert,
        clientCertificate,
      },
    };
    
  } catch (error) {
    console.error({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context: 'generateCertificates',
    });

    throw new Error('Failed to generate certificates. See logs for details.');
  }
}

module.exports = generateCertificates;