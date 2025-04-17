const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});

// const { InfluxDB } = require('@influxdata/influxdb-client');
// const { DeleteAPI } = require('@influxdata/influxdb-client-apis');
const influxClient = require('./influxdbClient.js');





let influxDeleteAPI = null;

(async () => {
  try {
    const { deleteAPI } = await influxClient.getClient();

    if (!deleteAPI) {
      console.error('InfluxDB write client is not initialized.');
    } else {
      influxDeleteAPI = deleteAPI;
      console.log('InfluxDB write client initialized successfully.');
    }
  } catch (error) {
    console.error('Failed to initialize InfluxDB write client:', error);
  }
})();


// Delete all records 
async function deleteAllMeasurementData(bucket, measurement, tag) {
    // define time interval for delete operation
    const startTime = '1970-01-01T00:00:00Z';
    const stop = new Date();
  
    await influxDeleteAPI.postDelete({
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
  
    await influxDeleteAPI.postDelete({
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


module.exports = {deleteAllMeasurementData, deleteMeasurement, initializeDeleteClient }