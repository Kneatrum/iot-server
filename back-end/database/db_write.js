
require('dotenv').config({ path: '../.env' });

const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const fs = require('fs');

const apiTokenPath = process.env.INFLUXDB_API_TOKEN_FILE;
const orgNamePath = process.env.INFLUXDB_ORGANISATION;
const bucketNamePath = process.env.INFLUXDB_BUCKET;

let token = null;
let org = null;
let bucket = null;
let client = null;
let writeClient = null;
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
        console.log('############ API Token:', apiToken);
        token = apiToken;
        client = new InfluxDB({url, token})
    })
    .catch((error) => {
        console.error('Error reading API token:', error);
        console.log("!!!!!!!!!!!!!! Can't proceed");
    });

waitForFileAndRead(orgNamePath)
    .then((orgName) => {
        console.log('############ Organisation :', orgName);
        org = orgName;
    })
    .catch((error) => {
        console.error('Error reading API token:', error);
        console.log("!!!!!!!!!!!!!! Can't proceed");
    });

waitForFileAndRead(bucketNamePath)
    .then((bucketName) => {
        console.log('############ Bucket :', bucketName);
        bucket = bucketName;
        writeClient = client.getWriteApi(org, bucket, 'ns');
    })
    .catch((error) => {
        console.error('Error reading API token:', error);
        console.log("!!!!!!!!!!!!!! Can't proceed");
    });


const { measurements, devices, tags, fields} = require('../constants');




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