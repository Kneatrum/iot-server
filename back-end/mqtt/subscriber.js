const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});

const mqtt = require('mqtt');

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
} = require('./channels');

// const { ch_microphone, ch_temperature, ch_action, ch_heart, ch_steps, ch_sleep } = require('./channels');

const mqttUrl = process.env.MQTT_HOST || 'mqtt://localhost:1883';
const client = mqtt.connect(mqttUrl);

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe([ch_temperature, ch_sound, ch_heart, ch_sleep, ch_walking, ch_jogging, ch_biking, ch_idle, ch_steps, ch_oxygen_saturation ], (err) => {
        if (!err) {
            console.log('Subscribed to topic');
        } else {
            console.log('Subscription error:', err);
        }
    });
});

client.on('message', (topic, message) => {
    console.log(`Received message: ${message.toString()} on topic: ${topic}`);
});

module.exports = client;
