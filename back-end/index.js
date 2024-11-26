const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? './.env' : `./.env.${env}`;
require('dotenv').config({path: envFile});

const { getSecret, createSecret, createDevSecret, getDevSecrets, createSessionSecret, getSessionSecret, getDevSessionSecrets, createDevSessionSecret } = require('./secrets/aws_secrets.js')
const { setupInfluxDB } = require('./databases/influxdb/db_init.js');
const { initializeReadClient } = require('./databases/influxdb/db_read.js')
const { initializeWriteClient } = require('./databases/influxdb/db_write.js')
const { initializeDeleteClient } = require('./databases/influxdb/db_delete.js')
const cors = require('cors');
const express = require('express');
const { sequelize } = require('./databases/postgres/models/index.js')
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// const { getAllData, getTemperature, getSteps } = require('./database/db_read');
// const {deleteAllMeasurementData, deleteMeasurement, deleteTag} = require('./database/db_delete');
const mqttClient = require('./mqtt/subscriber');
// const cron = require('node-cron');

const USERNAME = "Martin";
const PASSWORD = "password1234";
const ORG = "fitnessOrg";
const BUCKET = "fitBucket";
const PG_USERNAME = "postgress";
const PG_PASSWORD = "1234";
let sessionSecret = null;

const INFLUXDB_URL = process.env.INFLUXDB_HOST || 'http://localhost:8086';


function initializeDbClients(arg_url, arg_token, arg_org, arg_bucket){
    initializeReadClient(arg_url, arg_token, arg_org, arg_bucket)
    initializeWriteClient(arg_url, arg_token, arg_org, arg_bucket)
    initializeDeleteClient(arg_url, arg_token, arg_org, arg_bucket)
}


async function useSecret() {

    if(env === 'production'){
        const result = await getSecret();
        const sessionQuery = await getSessionSecret();
        const r = await sequelize.authenticate();
        console.log('Connected to database', r);

        if (result.success) {
            initializeDbClients(INFLUXDB_URL, result.data.apiKey, result.data.organisation, result.data.bucket);
        } else {
            let response = await setupInfluxDB(USERNAME, PASSWORD, ORG, BUCKET);
            if(response.success){
                createSecret(USERNAME, PASSWORD, response.data, BUCKET, ORG);
                initializeDbClients(INFLUXDB_URL, response.data, ORG, BUCKET);
            } else {
                console.log("Unable to retrieve the API token :");
                throw new Error("Unable to retrieve the API token")
            }
        }

        if(sessionQuery.success){
            // console.log(sessionQuery.data.sessionSecret);
            sessionSecret = sessionQuery.data.sessionSecret;
        } else {
            let response = await createSessionSecret();
            if(response.success){
                sessionSecret = response.data.sessionSecret
            } else {
                console.log("Unable to retrieve session secret")
                throw new Error("Unable to retrieve session secret")
            }
        }


    } else if (env === 'development'){
        console.log("Retrieving secrets from the development environment")
        let result = getDevSecrets();
        let sessionQuery = getDevSessionSecrets();
        
        if(result.success){
            let API_KEY = result.data.apiKey;
            let ORG = result.data.organisation;
            let BUCKET = result.data.bucket;
            initializeDbClients(INFLUXDB_URL, API_KEY, ORG, BUCKET);
            console.log("Logged in successfully")
        } else {
            let response = await setupInfluxDB(USERNAME, PASSWORD, ORG, BUCKET);
            if(response.success){
                createDevSecret(USERNAME, PASSWORD, response.data, BUCKET, ORG);
                initializeDbClients(INFLUXDB_URL, response.data, ORG, BUCKET);
                console.log("Onboarding success")
            } else {
                console.log("Unable to get the API token");
                throw new Error("Unable to retrieve API token");
            }
        }

        if(sessionQuery.success){
            sessionSecret =  sessionQuery.data
        } else {
            let result = await createDevSessionSecret();
            if(result.success){
                sessionSecret = result.data
            } else {
                throw new Error("Unable to create dev session secret");
            }
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
} = require('./databases/influxdb/db_write.js');

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
    },
    credentials: true,
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
const user_routes = require('./router/users.js');
const sslServicesRoutes = require('./router/ssl-services.js');


const sessionStore = new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000, // 15 Minutes interval at which to cleanup expired sessions in milliseconds.
    expiration: 24 * 60 * 60 * 1000  // One day maximum age (in milliseconds) of a valid session.
});


app.use("/", general_routes);

// Apply session middleware only for the /users routes
app.use(
    "/users",
    session({
        secret: sessionSecret,
        store: sessionStore,
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 60000 * 60,  // 1 hour
        }
    }),
    user_routes
);

app.use(
    "/ssl-services",
    session({
        secret: sessionSecret, 
        store: sessionStore, 
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 60000 * 60, 
        },
    }),
    sslServicesRoutes 
);

sessionStore.sync();

app.listen(backEndPort, () => {
    console.log(`Web server listening at ${backEndPort}`);
});

