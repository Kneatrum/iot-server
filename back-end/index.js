const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? './.env' : `./.env.${env}`;
require('dotenv').config({path: envFile});

const { getSecret, createSecret, createDevSecret, getDevSecrets } = require('./secrets/aws_secrets.js')
const { setupInfluxDB } = require('./database/db_init.js');
const { initializeReadClient } = require('./database/db_read.js')
const { initializeWriteClient } = require('./database/db_write.js')
const { initializeDeleteClient } = require('./database/db_delete.js')
const cors = require('cors');
const express = require('express');

// const { getAllData, getTemperature, getSteps } = require('./database/db_read');
// const {deleteAllMeasurementData, deleteMeasurement, deleteTag} = require('./database/db_delete');
const mqttClient = require('./mqtt/subscriber');
// const cron = require('node-cron');

const USERNAME = "Martin";
const PASSWORD = "password1234";
const ORG = "fitnessOrg";
const BUCKET = "fitBucket";

const INFLUXDB_URL = process.env.INFLUXDB_HOST || 'http://localhost:8086';


function initializeDbClients(arg_url, arg_token, arg_org, arg_bucket){
    initializeReadClient(arg_url, arg_token, arg_org, arg_bucket)
    initializeWriteClient(arg_url, arg_token, arg_org, arg_bucket)
    initializeDeleteClient(arg_url, arg_token, arg_org, arg_bucket)
}


async function useSecret() {

    if(env === 'production'){
        const result = await getSecret();

        if (result.success) {
            initializeDbClients(INFLUXDB_URL, result.data.apiKey, result.data.organisation, result.data.bucket);
        } else {
            let response = await setupInfluxDB(USERNAME, PASSWORD, ORG, BUCKET);
            if(response.success){
                createSecret(USERNAME, PASSWORD, response.data, BUCKET, ORG);
                initializeDbClients(INFLUXDB_URL, response.data, ORG, BUCKET);
            } else {
                console.log("Unable to get the API token :");
            }
        }

    } else if (env === 'development'){
        /* 
        .
        .
        Ensure that you have manually finished the onboarding process by going to this url http://localhost:8086 before getting here.
        In the onboarding process, fill in the required details and copy the following for use in the .env.development file.
        - api token
        - bucket name
        - organisation name

        In the .env.development file, create the following environment variables and assign their respective values (outlined above)
        - API_KEY=<api token>
        - ORG=<organisation name>
        - BUCKET=<bucket name>
        .
        .
        */
        let result = getDevSecrets();
        if(result.success){
            let API_KEY = result.data.apiKey;
            let ORG = result.data.organisation;
            let BUCKET = result.data.bucket;
            initializeDbClients(INFLUXDB_URL, API_KEY, ORG, BUCKET);
        } else {
            console.log(`Please got to ${INFLUXDB_URL} \
                and finish \ the onboarding process, \
                then save the bucket, organisation and \
                api token in the development environment variables file`)
            /*
            TODO: 

            let response = await setupInfluxDB(USERNAME, PASSWORD, ORG, BUCKET);
            if(response.success){
                createDevSecret(USERNAME, PASSWORD, response.data.apiKey, BUCKET, ORG);
                initializeDbClients(INFLUXDB_URL, response.data, ORG, BUCKET);
            } else {
                console.log("Unable to get the API token");
            }
            */
        }
    }
    
  }


useSecret();



const frontEndHost = process.env.FRONTEND_HOST || 'http://localhost';
const HOST_URL =  process.env.HOST_URL || 'http://localhost'

const backEndHost = process.env.BACKEND_HOST || 'http://localhost';
const backEndPort = 3000;


let previous_sleep_value = null;

const { 
    writeTemperature, 
    writeHeartRate, 
    writeSound, 
    writeSleepData,
    writeWalkingDuration,
    writeJoggingDuration,
    writeSteps,
    writeBikingData,
    writeIdlingDuration,
    writeOxygenSaturation
} = require('./database/db_write');

const {     
    ch_temperature,
    ch_sound,
    ch_heart,
    ch_sleep,
    ch_walking,
    ch_jogging,
    ch_biking,
    ch_idle, 
    ch_steps,
    ch_oxygen_saturation
} = require('./mqtt/channels');

const allowedOrigins = [
    frontEndHost,
    HOST_URL,
  ];

const app = express();

app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin, like mobile apps or curl requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        // If the origin is in the allowedOrigins array, allow the request
        callback(null, true);
      } else {
        // If the origin is not allowed, return an error
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));



mqttClient.on('message', (topic, message) => {
    latestMessage = `Received message: ${message.toString()} on topic: ${topic}`;

    if (topic === ch_temperature){
        writeTemperature(message);
        console.log(`Temperature: ${message}.`)
    } else if (topic === ch_sound){
        writeSound(message)
        console.log(`Sound Type: ${message}.`)
    } else if (topic === ch_heart){
        writeHeartRate(message);
        console.log(`Heart rate: ${message} beats per minute.`)
    } else if (topic === ch_sleep){
        if (previous_sleep_value !== null){
            writeSleepData(previous_sleep_value);
        }
        writeSleepData(message);
        previous_sleep_value = message;
        console.log(`Sleep level: ${message}.`)
    } else if (topic === ch_walking){
        writeWalkingDuration(message);
        console.log(`Walking for ${message} minutes.`)
    } else if (topic === ch_jogging){
        writeJoggingDuration(message);
        console.log(`Jogging for ${message} minutes.`)
    } else if (topic === ch_steps){
        writeSteps(message);
        console.log(`${message} steps so far`);
    } else if (topic === ch_biking){
        writeBikingData(message);
        console.log(`Biking data: ${message}.`)
    } else if (topic === ch_idle){
        writeIdlingDuration(message);
        console.log(`Idling data: ${message}.`)
    } else if( topic === ch_oxygen_saturation ){
        writeOxygenSaturation(message);
        console.log(`Oxygen saturation: ${message}`);
    }

    // deleteMeasurement(bucket, 'sleep');
    // deleteMeasurement(bucket, 'idling');
    // deleteMeasurement(bucket, 'walking');
    // deleteMeasurement(bucket, 'jogging');
    // deleteMeasurement(bucket, 'biking');
    // deleteMeasurement(bucket, 'heart');
    // deleteMeasurement(bucket, 'steps');
    // deleteMeasurement(bucket, 'temperature');
    // deleteMeasurement(bucket, 'oxygen');

});



// async function stepsInitialisation(){
//     const data = await getSteps(0);
//     if(data.labels.length === 0){
//         writeSteps(0);
//     } else {
//         let today = new Date().getDate();
//         let latestDataPoint = data.labels[data.labels.length - 1];
//         let latestDataPointDate = latestDataPoint.getDate();
//         let difference = today - latestDataPointDate;
//         if(difference > 0){
//             writeSteps(0);
//         }
        
//     }
// }

// stepsInitialisation();

// Schedule the cron job to run at midnight
// cron.schedule('0 0 * * *', async () => {
//     console.log('Resetting the number of steps at midnight');
//         const data = await getSteps(0);
//         if(data.labels.length === 0){
//             writeSteps(0);
//         } else {
//             let today = new Date().getDate();
//             let latestDataPoint = data.labels[data.labels.length - 1];
//             let latestDataPointDate = latestDataPoint.getDate();
//             let difference = today - latestDataPointDate;
//             if(difference > 0){
//                 writeSteps(0);
//             }
//         }
//   });

const general_routes = require('./router/general.js').general;
app.use("/", general_routes);

app.listen(backEndPort, () => {
    console.log(`Web server listening at ${backEndPort}`);
});

