// const influxClient = require('./database/influxdbClient.js');



require('dotenv').config();
const cors = require('cors');
// const express = require('express');
// const mqttClient = require('./mqtt/subscriber');
// const { getSecret, createSecret } = require('./secrets/aws_secrets.js')
const general_routes = require('./router/general.js').general;

// const { setupInfluxDB } = require('./database/db_init.js');
// const { getAllData, getTemperature, getSteps } = require('./database/db_read');
// const {deleteAllMeasurementData, deleteMeasurement, deleteTag} = require('./database/db_delete');
// const cron = require('node-cron');

// const USERNAME = "Martin";
// const PASSWORD = "password1234";
// const ORG = "fitnessOrg";
// const BUCKET = "fitBucket";

// const url = process.env.INFLUXDB_HOST || 'http://localhost:8086';


// async function useSecret() {
//     const result = await getSecret();
    
//     if (result.success) {
//         console.log("#################\nSecret retrieved successfully:", result.data);
//         influxClient.initialize(
//             url, 
//             result.data.apiKey, 
//             result.data.organisation, 
//             result.data.bucket
//         );
//     } else {
//         console.error("!!!!!!!!!!!!!!!!!!!\nFailed to retrieve secret:");
//         console.log("Setting up db");
        // let response = await setupInfluxDB(USERNAME, PASSWORD, ORG, BUCKET);
        // if(response.success){
        //     console.log("Api token :", response);
        //     createSecret(USERNAME, PASSWORD, response.data, BUCKET, ORG);
        //     influxClient.initialize(url, response.data, ORG, BUCKET);
        //     console.log("Wohoo");
        // } else {
        //     console.log("Unable to get the API token :");
        // }
//     }
//   }

//   useSecret();



const frontEndHost = process.env.FRONTEND_HOST || 'http://localhost';
const HOST_URL =  process.env.HOST_URL || 'http://localhost'

// const backEndHost = process.env.BACKEND_HOST || 'http://localhost';
const backEndPort = 3000;


// let previous_sleep_value = null;

// const { 
//     writeTemperature, 
//     writeHeartRate, 
//     writeSound, 
//     writeSleepData,
//     writeWalkingDuration,
//     writeJoggingDuration,
//     writeSteps,
//     writeBikingData,
//     writeIdlingDuration,
//     writeOxygenSaturation
// } = require('./database/db_write');

// const {     
//     ch_temperature,
//     ch_sound,
//     ch_heart,
//     ch_sleep,
//     ch_walking,
//     ch_jogging,
//     ch_biking,
//     ch_idle, 
//     ch_steps,
//     ch_oxygen_saturation
// } = require('./mqtt/channels');

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

// mqttClient.on('message', (topic, message) => {
//     latestMessage = `Received message: ${message.toString()} on topic: ${topic}`;

//     if (topic === ch_temperature){
//         writeTemperature(message);
//         console.log(`Temperature: ${message}.`)
//     } else if (topic === ch_sound){
//         writeSound(message)
//         console.log(`Sound Type: ${message}.`)
//     } else if (topic === ch_heart){
//         writeHeartRate(message);
//         console.log(`Heart rate: ${message} beats per minute.`)
//     } else if (topic === ch_sleep){
//         if (previous_sleep_value !== null){
//             writeSleepData(previous_sleep_value);
//         }
//         writeSleepData(message);
//         previous_sleep_value = message;
//         console.log(`Sleep level: ${message}.`)
//     } else if (topic === ch_walking){
//         writeWalkingDuration(message);
//         console.log(`Walking for ${message} minutes.`)
//     } else if (topic === ch_jogging){
//         writeJoggingDuration(message);
//         console.log(`Jogging for ${message} minutes.`)
//     } else if (topic === ch_steps){
//         writeSteps(message);
//         console.log(`${message} steps so far`);
//     } else if (topic === ch_biking){
//         writeBikingData(message);
//         console.log(`Biking data: ${message}.`)
//     } else if (topic === ch_idle){
//         writeIdlingDuration(message);
//         console.log(`Idling data: ${message}.`)
//     } else if( topic === ch_oxygen_saturation ){
//         writeOxygenSaturation(message);
//         console.log(`Oxygen saturation: ${message}`);
//     }

//     // deleteMeasurement(bucket, 'sleep');
//     // deleteMeasurement(bucket, 'idling');
//     // deleteMeasurement(bucket, 'walking');
//     // deleteMeasurement(bucket, 'jogging');
//     // deleteMeasurement(bucket, 'biking');
//     // deleteMeasurement(bucket, 'heart');
//     // deleteMeasurement(bucket, 'steps');
//     // deleteMeasurement(bucket, 'temperature');
//     // deleteMeasurement(bucket, 'oxygen');

// });



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

app.use("/", general_routes);

app.listen(backEndPort, () => {
    console.log(`Web server listening at ${backEndPort}`);
});

