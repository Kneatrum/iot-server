const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});

// const { InfluxDB } = require('@influxdata/influxdb-client');
const { Point } = require('@influxdata/influxdb-client')
const { measurements, devices, tags, fields} = require('../../constants');
const influxClient = require('./influxdbClient.js');



let influxWriteClient = null;

(async () => {
  try {
    const { writeClient } = await influxClient.getClient();

    if (!writeClient) {
      console.error('InfluxDB write client is not initialized.');
    } else {
      influxWriteClient = writeClient;
      console.log('InfluxDB write client initialized successfully.');
    }
  } catch (error) {
    console.error('Failed to initialize InfluxDB write client:', error);
  }
})();



// function initializeWriteClient(arg_url, arg_token, arg_organisation, arg_bucket) {
//   url = arg_url;
//   token = arg_token;
//   org = arg_organisation;
//   bucket = arg_bucket;
//   let client = new InfluxDB({ url, token });
//   writeClient = client.getWriteApi(org, bucket, 'ns');
// }


// // Write action.
// const writeAction = (action) => {
//   let point = new Point(measurements.activity)
//     .tag(tags.device, devices.device_1)
//     .intField('action', action)

//   void setTimeout(() => {
//     writeClient.writePoint(point)
//   }, 1000) // separate points by 1 second

//   void setTimeout(() => {
//     writeClient.flush()
//   }, 5000)
// }


const writeData = (metadata, dataPoint, field) => {

  let point = new Point(measurements.free_tier_iot_data)
    .tag(tags.user_id, metadata.user_id)
    .tag(tags.user_email, metadata.user_email)
    .tag(tags.device_name, metadata.device_name)
    .tag(tags.device_serial_no, metadata.device_serial_no)

  if (Number.isInteger(dataPoint)) {
    point.intField(field, dataPoint);
  } else if (typeof dataPoint === 'number') {
    point.floatField(field, dataPoint);
  } else if (typeof dataPoint === 'boolean') {
    point.booleanField(field, dataPoint);
  } else {
    point.stringField(field, dataPoint);
  }


  void setTimeout(() => {
    influxWriteClient.writePoint(point)
  }, 1) // separate points by 1 millisecond

  void setTimeout(() => {
    influxWriteClient.flush()
  }, 5000)
}


// // Write temperature.
// const writeTemperature = (degrees) => {
//   let point = new Point(measurements.temperature)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.degrees, degrees)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 1000) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }


// // Write heart rate.
// const writeHeartRate = (bpm) => {
//   let point = new Point(measurements.heart_rate)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.beats_per_inute, bpm)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 1) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }


// // Write sound
// const writeSound = (sound) => {
//   let point = new Point(measurements.sound)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.sound, sound)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 1000) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }

// // Write Sleep
// const writeSleepData = (sleep_stage) => {
//   let point = new Point(measurements.sleep)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.sleep_stage, sleep_stage)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 0) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }


// // Write walking duration
// const writeWalkingDuration = (duration) => {
//   let point = new Point(measurements.walking)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.minutes, duration)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 1000) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }


// // Write walking steps
// const writeSteps = (steps) => {
//   let point = new Point(measurements.steps)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.steps, steps)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 1000) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }


// // Write jogging steps
// const writeJoggingDuration = (duration) => {
//   let point = new Point(measurements.jogging)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.minutes, duration)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 1000) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }


// // Write biking data
// const writeBikingData = (biking_data) => {
//   let point = new Point(measurements.biking)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.minutes, biking_data)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 1000) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }


// // Write idling data
// const writeIdlingDuration = (duration) => {
//   let point = new Point(measurements.idling)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.minutes, duration)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 1000) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }

// // Write oxygen saturation data
// const writeOxygenSaturation = (percentage) => {
//   let point = new Point(measurements.oxygen)
//     .tag(tags.device, devices.device_1)
//     .intField(fields.percentage, percentage)

//   void setTimeout(() => {
//     influxWriteClient.writePoint(point)
//   }, 1) // separate points by 1 second

//   void setTimeout(() => {
//     influxWriteClient.flush()
//   }, 5000)
// }


module.exports = { writeData };