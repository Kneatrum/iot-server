require('dotenv').config({ path: '../.env'});

const {InfluxDB} = require('@influxdata/influxdb-client')
const { DeleteAPI } = require('@influxdata/influxdb-client-apis');
const CONFIG = require('../../config.json');


const dbHost = CONFIG.influxdb.host;
const dbPort = CONFIG.influxdb.port;

const token = process.env.API_TOKEN
const url = "http://" + dbHost + ":" + dbPort;
const org = "kneatrum"

const client = new InfluxDB({url, token})
const deleteAPI = new DeleteAPI(client)




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