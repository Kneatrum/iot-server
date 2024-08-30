require('dotenv').config({ path: '../.env'});

const {InfluxDB} = require('@influxdata/influxdb-client');
const { DeleteAPI } = require('@influxdata/influxdb-client-apis');

const fs = require('fs');

const apiTokenPath = process.env.INFLUXDB_API_TOKEN_FILE;
const orgNamePath = process.env.INFLUXDB_ORGANISATION;
const bucketNamePath = process.env.INFLUXDB_BUCKET;

let token = null;
let org = null;
let bucket = null;
let client = null;
let deleteAPI = null;
const url = process.env.INFLUXDB_HOST || 'http://localhost:8086';


// Function to check if a file exists with a timeout
function fileExists(filePath, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const checkInterval = setInterval(() => {
            if (fs.existsSync(filePath)) {
                clearInterval(checkInterval);
                resolve(true);
            } else if (Date.now() - start >= timeout) {
                clearInterval(checkInterval);
                reject(new Error(`Timeout: File ${filePath} did not appear within ${timeout}ms`));
            }
        }, 100); // Check every 100ms
    });
}

// Function to wait for the file to exist and then read it
function waitForFileAndRead(filePath, timeout) {
    return fileExists(filePath, timeout)
        .then(() => {
            return fs.readFileSync(filePath, 'utf8').trim();
        });
}



waitForFileAndRead(apiTokenPath)
    .then((apiToken) => {
        token = apiToken;
        client = new InfluxDB({url, token});
        deleteAPI = new DeleteAPI(client);
    })
    .catch((error) => {
        console.error('Error reading API token:', error);
    });

waitForFileAndRead(orgNamePath)
    .then((orgName) => {
        org = orgName;
    })
    .catch((error) => {
        console.error('Error reading API token:', error);
    });

waitForFileAndRead(bucketNamePath)
    .then((bucketName) => {
        bucket = bucketName;
    })
    .catch((error) => {
        console.error('Error reading API token:', error);
    });


// Delete all records 
async function deleteAllMeasurementData(bucket, measurement, tag) {
    // define time interval for delete operation
    const startTime = '1970-01-01T00:00:00Z';
    const stop = new Date();
  
    await deleteAPI.postDelete({
      org,
      bucket: bucket,
      // you can better specify orgID, bucketID in place or org, bucket if you already know them
      body: {
        start: startTime,
        stop: stop.toISOString(),
        // see https://docs.influxdata.com/influxdb/latest/reference/syntax/delete-predicate/
        predicate: `_measurement="${measurement}" AND component="${tag}"`
      },
    })
}


async function deleteMeasurement(bucket, measurement) {
    // define time interval for delete operation
    const startTime = '1970-01-01T00:00:00Z';
    const stop = new Date();
  
    await deleteAPI.postDelete({
      org,
      bucket: bucket,
      // you can better specify orgID, bucketID in place or org, bucket if you already know them
      body: {
        start: startTime,
        stop: stop.toISOString(),
        // see https://docs.influxdata.com/influxdb/latest/reference/syntax/delete-predicate/
        predicate: `_measurement="${measurement}"`,
      },
    })
  }


module.exports = {deleteAllMeasurementData, deleteMeasurement}