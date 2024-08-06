require('dotenv').config();
const cors = require('cors');
const express = require('express');
const general_routes = require('./router/general.js').general;
const bucket = "fitbit"
const { getAllData, getTemperature, getSteps } = require('./database/db_read');
const {deleteAllMeasurementData, deleteMeasurement, deleteTag} = require('./database/db_delete');
const mqttClient = require('./mqtt/subscriber');
const CONFIG = require('../config.json');

const frontEndHost = CONFIG["front-end"].servicename;
const frontEndPort = CONFIG["front-end"].port;

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



const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://' + frontEndHost + ':' + frontEndPort // Allow requests from this origin
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

async function stepsInitialisation(){
    const data = await getSteps(0);
    if(data.labels.length === 0){
        writeSteps(0);
    } else {
        let today = new Date().getDate();
        let latestDataPoint = data.labels[data.labels.length - 1];
        let latestDataPointDate = latestDataPoint.getDate();
        let difference = today - latestDataPointDate;
        if(difference > 0){
            writeSteps(0);
        }
        
    }
}

stepsInitialisation();

// Schedule the cron job to run at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Resetting the number of steps at midnight');
        const data = await getSteps(0);
        if(data.labels.length === 0){
            writeSteps(0);
        } else {
            let today = new Date().getDate();
            let latestDataPoint = data.labels[data.labels.length - 1];
            let latestDataPointDate = latestDataPoint.getDate();
            let difference = today - latestDataPointDate;
            if(difference > 0){
                writeSteps(0);
            }
        }
  });

app.use("/", general_routes);

const port = 3000;
app.listen(port, () => {
    console.log(`Web server listening at http://${frontEndHost}:${port}`);
});

