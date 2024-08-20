const mqtt = require('mqtt');

const brokerHost = 'mosquitto';
const brokerPort = 1883;

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

const mqttUrl = "mqtt://" + brokerHost + ":" + brokerPort;
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
