
require('dotenv').config({ path: '../.env' });
const { influxClient } = require('./influxdbClient');
const { Point } = require('@influxdata/influxdb-client')




const { measurements, devices, tags, fields} = require('../constants');


let writeClient;

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


// Write temperature.
const writeTemperature = (degrees) => {
  let point = new Point(measurements.temperature)
    .tag(tags.device, devices.device_1)
    .intField(fields.degrees, degrees)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}


// Write heart rate.
const writeHeartRate = (bpm) => {
  let point = new Point(measurements.heart_rate)
    .tag(tags.device, devices.device_1)
    .intField(fields.beats_per_inute, bpm)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}


// Write sound
const writeSound = (sound) => {
  let point = new Point(measurements.sound)
    .tag(tags.device, devices.device_1)
    .intField(fields.sound, sound)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}

// Write Sleep
const writeSleepData = (sleep_stage) => {
  let point = new Point(measurements.sleep)
    .tag(tags.device, devices.device_1)
    .intField(fields.sleep_stage, sleep_stage)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 0) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}


// Write walking duration
const writeWalkingDuration = (duration) => {
  let point = new Point(measurements.walking)
    .tag(tags.device, devices.device_1)
    .intField(fields.minutes, duration)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}


// Write walking steps
const writeSteps = (steps) => {
  let point = new Point(measurements.steps)
    .tag(tags.device, devices.device_1)
    .intField(fields.steps, steps)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}


// Write jogging steps
const writeJoggingDuration = (duration) => {
  let point = new Point(measurements.jogging)
    .tag(tags.device, devices.device_1)
    .intField(fields.minutes, duration)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}


// Write biking data
const writeBikingData = (biking_data) => {
  let point = new Point(measurements.biking)
    .tag(tags.device, devices.device_1)
    .intField(fields.minutes, biking_data)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}


// Write idling data
const writeIdlingDuration = (duration) => {
  let point = new Point(measurements.idling)
    .tag(tags.device, devices.device_1)
    .intField(fields.minutes, duration)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}

// Write oxygen saturation data
const writeOxygenSaturation = (percentage) => {
  let point = new Point(measurements.oxygen)
    .tag(tags.device, devices.device_1)
    .intField(fields.percentage, percentage)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}


module.exports = {
  writeTemperature, 
  writeHeartRate, 
  writeSound,
  writeSleepData,
  writeWalkingDuration,
  writeSteps,
  writeJoggingDuration,
  writeBikingData,
  writeIdlingDuration,
  writeOxygenSaturation
};