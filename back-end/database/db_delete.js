require('dotenv').config({ path: '../.env'});
const { influxClient } = require('./influxdbClient');

let bucket;
let deleteAPI;

initializeInfluxClient().catch(error => {
  console.error('Error during module initialization:', error);
});

async function initializeInfluxClient() {
  const retryInterval = 1000; // Interval between retries (in ms)
  const maxRetryDuration = 60000; // Maximum duration to keep retrying (in ms) - 1 minute in this case

  const startTime = Date.now();

  while (Date.now() - startTime < maxRetryDuration) {
    try {
      // Try to initialize the client
      const clientData = await influxClient.getClient();
      bucket = clientData.bucket;
      deleteAPI = clientData.deleteAPI;

      console.log('InfluxDB client initialized successfully.');
      return; // Exit the loop if successful
    } catch (error) {
      console.error('Failed to initialize InfluxDB client. Retrying...', error);
      await delay(retryInterval); // Wait before retrying
    }
  }

  console.error(`Failed to initialize InfluxDB client after ${maxRetryDuration / 1000} seconds.`);
  throw new Error('Failed to initialize InfluxDB client within the allowed time frame.');
}

// Helper function to add delay between retries
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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