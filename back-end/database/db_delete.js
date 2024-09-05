require('dotenv').config({ path: '../.env'});
const { InfluxDB } = require('@influxdata/influxdb-client');
const { DeleteAPI } = require('@influxdata/influxdb-client-apis');


let deleteAPI = null;


function initializeDeleteClient(arg_url, arg_token, arg_organisation, arg_bucket) {
  url = arg_url;
  token = arg_token;
  org = arg_organisation;
  bucket = arg_bucket;
  let client = new InfluxDB({ url, token });
  deleteAPI = new DeleteAPI(client);
  queryClient = client.getQueryApi(org);
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


module.exports = {deleteAllMeasurementData, deleteMeasurement, initializeDeleteClient }