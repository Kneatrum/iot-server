const express = require('express');
const { getAllData, getHeartBeatRate, getTemperature, getAction, getSound, getSleepData, getWalkingData, getJoggingData, getSteps, getBikingData, getIdlingData, getOxygenSaturationData } = require('../databases/influxdb/db_read');
const public_users = express.Router();
const TIMEOUT = 5;




// Home page
public_users.get('/',function (req, res) {
    let myPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            let success = true;
            if(success){
                resolve("Promise resolved");
            } else {
                reject("Promise rejected");
            }
        }, TIMEOUT);
    });

    myPromise.then(() => {
        res.send('Hello Martin')
    });
});


// Get all data
public_users.get('/api/all',async function (req, res) {
    try {
        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getAllData();
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get heart beat rate
public_users.get('/api/heart/:date?',async function (req, res) {
    try {

        let date = req.params.date || 0;

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getHeartBeatRate(date);
        res.send(data);
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get temperature
public_users.get('/api/temperature/:date?',async function (req, res) {
    try {

        let date =  req.params.date || 0;

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getTemperature(date);
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get action
public_users.get('/api/action/:date?',async function (req, res) {
    try {

        let date =  req.params.date || 0;

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getAction(date);
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get sound
public_users.get('/api/sound/:date?',async function (req, res) {
    try {

        let date =  req.params.date || 0;

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getSound(date);
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get sleep data
public_users.get('/api/sleep/:date?',async function (req, res) {
    try {
        let date =  req.params.date || 0;
        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getSleepData(date);
        res.send(data);
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get walking data
public_users.get('/api/walking/:date?',async function (req, res) {
    try {

        let date =  req.params.date || 0;

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getWalkingData(date);
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get jogging data
public_users.get('/api/jogging/:date?',async function (req, res) {
    try {

        let date =  req.params.date || 0;

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getJoggingData(date);
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get steps
public_users.get('/api/steps/:days?',async function (req, res) {
    try {
        
        let days = req.params.days || 0; // If no parameter is passed, use 0 as the default

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getSteps(days);
        res.send(data);
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get biking data
public_users.get('/api/biking/:date?',async function (req, res) {
    try {

        let date =  req.params.date || 0;

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getBikingData(date);
        res.send(JSON.stringify({data}, null, 4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get idling data
public_users.get('/api/idling/:date?',async function (req, res) {
    try {

        let date =  req.params.date || 0;

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getIdlingData(date);
        res.send(JSON.stringify({data}, null, 4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get idling data
public_users.get('/api/oxygen/:date',async function (req, res) {
    try {

        let date = req.params.date; 

        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let success = true;
                if(success){
                    resolve("Promise resolved");
                } else {
                    reject("Promise rejected");
                }
            }, TIMEOUT);
        });

        await myPromise;
        const data = await getOxygenSaturationData(date);
        res.send(data);
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});

module.exports.general = public_users;
