const express = require('express');
const { getAllData, getHeartBeatRate, getTemperature, getAction, getSound, getSleepData, getWalkingData, getJoggingData, getSteps, getBikingData, getIdlingData } = require('../database/db_read');
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
public_users.get('/all',async function (req, res) {
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
public_users.get('/heart',async function (req, res) {
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
        const data = await getHeartBeatRate();
        res.send(data);
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get temperature
public_users.get('/temperature',async function (req, res) {
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
        const data = await getTemperature();
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get action
public_users.get('/action',async function (req, res) {
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
        const data = await getAction();
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get sound
public_users.get('/sound',async function (req, res) {
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
        const data = await getSound();
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get sleep data
public_users.get('/sleep',async function (req, res) {
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
        const data = await getSleepData();
        res.send(data);
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get walking data
public_users.get('/walking',async function (req, res) {
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
        const data = await getWalkingData();
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get jogging data
public_users.get('/jogging',async function (req, res) {
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
        const data = await getJoggingData();
        res.send(JSON.stringify({data},null,4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get steps
public_users.get('/steps',async function (req, res) {
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
        const data = await getSteps();
        res.send(data);
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get biking data
public_users.get('/biking',async function (req, res) {
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
        const data = await getBikingData();
        res.send(JSON.stringify({data}, null, 4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


// Get idling data
public_users.get('/idling',async function (req, res) {
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
        const data = await getIdlingData();
        res.send(JSON.stringify({data}, null, 4));
    } catch (error){
        console.error('Error: ', error);
        res.status(500).send('An error occurred while fetching data')
    }
});


module.exports.general = public_users;
