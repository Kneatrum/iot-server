const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});


const pem = require("pem");
const fs = require("fs");
const path = require("path");


const caCrtPath = path.join(__dirname, '../../mosquitto/certs/ca.crt');
const caKeyPath = path.join(__dirname, '../../mosquitto/certs/ca.key');
const caKeyPassword = process.env.CA_PASSWORD
const clientCsrSubject = process.env.CLIENT_CSR_SUBJECT



function parseCsrSubject(csrSubject) {
  const fields = csrSubject.split('/').filter(Boolean); // Remove empty strings
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


/* openssl genrsa -out client.key 2048 */
async function generateClientPrivateKey() {
  return new Promise((resolve, reject) => {
    // Generate a 2048-bit RSA private key
    pem.createPrivateKey(2048, (err, key) => {
      if (err) return reject(err);
      resolve({clientPrivateKey: key});
    });
  });
}


//____________________________________________________________________________________________________


/* openssl req -new -out client.csr -key client.key */
async function generateClientCSR(subjectDetails, clientPrivateKey) {
  return new Promise((resolve, reject) => {

    // Create a CSR with the provided subject details
    pem.createCSR(
      {
        key: clientPrivateKey,
        commonName: subjectDetails.CN,
        country: subjectDetails.C,
        state: subjectDetails.ST,
        locality: subjectDetails.L,
        organization: subjectDetails.O,
        organizationUnit: subjectDetails.OU,
        emailAddress: "", // Client's email address
        challengePassword: "", // No challenge password
      },
      (err, csr) => {
        if (err) return reject(err);
        resolve({ clientCSR: csr});
      }
    );
  });
}



/* openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAserial serialfile -out client.crt -days 360 */
async function signClientCSR(
  caCertificatePath, 
  caPrivateKeyPath,
  caKeyPassword,
  clientCertificateSigningRequest,
  deviceSerialNumber
) {
  return new Promise((resolve, reject) => {
    // Read CA certificate, CA key, and client CSR
    const caCertificate = fs.readFileSync(caCertificatePath, "utf8");
    const caKey = fs.readFileSync(caPrivateKeyPath, "utf8");
  

    // Sign the CSR with the CA
    pem.createCertificate(
      {
        serviceCertificate: caCertificate, // CA certificate
        serviceKey: caKey, // CA private key
        csr: clientCertificateSigningRequest, // Client CSR
        serviceKeyPassword: caKeyPassword, // Password for the CA private key
        serial: deviceSerialNumber, // Serial number (unique for each cert)
        days: 360, // Certificate validity in days
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
      // Parse and update the CSR subject
      // console.log("CSR Subject: ", clientCsrSubject)
      const tempSubjectObject = updateSubjectObject(parseCsrSubject(clientCsrSubject), {
        C: country,
        ST: state,
        L: locality,
        O: organization,
        OU: organizationUnit,
        CN: serialNumber,
      });
  
      
      const subjectObject = constructCsrSubject(tempSubjectObject);
  
      // Debug logging (enabled via environment variable)
      if (process.env.DEBUG_MODE === 'true') {
        console.log('Updated Subject Object:', tempSubjectObject);
        console.log('Modified CSR Subject:', subjectObject);
      }
  
      // Generate the private key
      const { clientPrivateKey } = await generateClientPrivateKey();
  
  
      // Generate the CSR
      const { clientCSR } = await generateClientCSR(subjectObject, clientPrivateKey.key);
      // console.log("Client CSR: ", clientCSR.csr)
  
      // Sign the CSR to create the certificate
      const { signedCert: clientCertificate } = await signClientCSR(
        caCrtPath,
        caKeyPath,
        caKeyPassword,
        clientCSR.csr,
        subjectObject.CN
      );

      const caCertificate = fs.readFileSync(caCrtPath, "utf8");
  
      // Return the generated artifacts
      return {
        status: 'success',
        data: {
          privateKey: clientPrivateKey.key,
          caCert: caCertificate,
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


module.exports =  generateCertificates;