require('dotenv').config({ path: '../.env'});

const { deleteAPI } = influxClient.getClient();




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