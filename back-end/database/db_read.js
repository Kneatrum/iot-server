
require('dotenv').config({ path: '../.env' });

const {InfluxDB} = require('@influxdata/influxdb-client')
const { measurements, devices, tags, fields} = require('../constants');
const CONFIG = require('../../config.json');

const dbHost = CONFIG.influxdb.host;
const dbPort = CONFIG.influxdb.port;


const token = process.env.API_TOKEN
const url = "http://" + dbHost + ":" + dbPort;
const org = "kneatrum"
const bucket = "fitbit"

const client = new InfluxDB({url, token})

let queryClient = client.getQueryApi(org)

const sleepStates = ['deep', 'light', 'rem', 'awake'];



function formatMinutes(minutes) {
    const strMinutes = minutes.toFixed(1)
    if (strMinutes < 60) {
        return `${strMinutes} min`;
    } else {
        const hours = Math.floor(strMinutes / 60);
        const remainingMinutes = strMinutes % 60;
        return `${hours} h ${remainingMinutes} min`;
    }
}

function extractTimeHHMMSS(isoString) {
    // Create a Date object from the ISO string
    const date = new Date(isoString);

    // Extract the hours, minutes, and seconds
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    // Return the time in hh:mm:ss format
    return `${hours}:${minutes}:${seconds}`;
}

function toFixedNumber(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}



// Get time summary
function getTimeSummary(input_data){

    // if(input_data.data.lenth === 0) return null;

    let time_breakdown = {
        states : {},
        totalTime: 0
    };

    
    let previous_time = null;

    input_data.forEach(obj => {
        const current_time = new Date(obj.time);
        const current_object = obj;
        if (previous_time !== null){
            const timeDiffMinutes = (current_time - previous_time) / (1000 * 60); // Difference in minutes
            if (!time_breakdown.states.hasOwnProperty(sleepStates[previous_object.value])) { 
                let details = { time: 0, percentage: 0}
                time_breakdown.states[sleepStates[previous_object.value]] = details;
            }
            time_breakdown.states[sleepStates[previous_object.value]].time += timeDiffMinutes;
            time_breakdown.totalTime += timeDiffMinutes;
        } 
        previous_object = current_object;
        previous_time = current_time;
    });


    sleepStates.forEach(state => {
        // Calculate the percentage and fill it out now that we have total time and time per sleep state.
        if( time_breakdown.states.hasOwnProperty(state) ){
            time_breakdown.states[state].percentage = toFixedNumber(((time_breakdown.states[state].time / time_breakdown.totalTime) * 100), 1)
            time_breakdown.states[state].time = toFixedNumber(time_breakdown.states[state].time, 1);
        }
    });
        
    // Converting total time in minutes to string format hh:mm or mm if less than 60.
    time_breakdown.totalTime = toFixedNumber(time_breakdown.totalTime, 1);

    return time_breakdown;
}




// Get all data
const getAllData = () => {
    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "sleep"
        )`;

        let tableObjects = [];

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row);
                tableObjects.push(tableObject);
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess')
                resolve(tableObjects);
            },
        });
    });
}


// Get heart beat rate
const getHeartBeatRate = () => {

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "${measurements.heart_rate}" and
            r.${tags.device} == "${devices.device_1}"
        )`;

        let results = {
            labels: [],
            data: []
        };

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                results.labels.push(extractTimeHHMMSS(time));
                results.data.push(value)
            },
            error: (error) => {
                console.error('\nError', error);
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess');
                resolve(results);
            },
        });
    });
}


// Get temperature
const getTemperature = () => {

    return new Promise((resolve, reject) => {
        console.log("Start")
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "${measurements.temperature}" and
            r.${tags.device} == "${devices.device_1}"
        )`;

        let results = [];

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row);
                const { _time: time, _value: value } = tableObject;
                results.push({ time, value });
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess')
                resolve(results);
            },
        });
    });
}


// Get action
const getAction = () => {
    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "device" and
            r.${tags.device} == "imu"
        )`;

        let results = [];

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                results.push({ time, value });
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess')
                resolve(results);
            },
        });
    });
}


// Get sound.
const getSound = () => {

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "${measurements.sound}" and
            r.${tags.device} == "${devices.device_1}"
        )`;

        let results = [];

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                results.push({ time, value });
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess')
                resolve(results);
            },
        });
    });
}

// Get sleep data.
const getSleepData = () => {

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "${measurements.sleep}" and
            r.${tags.device} == "${devices.device_1}"
        )`;

        let payload = {
            chartData: null,
            timeBreakdown: null
        }
        let results = [];

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                results.push({ time, value });
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess') 
                if(results.length > 0){
                    const time_breakdown = getTimeSummary(results);
                    payload.chartData = results;
                    payload.timeBreakdown = time_breakdown
                } 
        
                resolve(payload);
            },
        });
    });
}


// Get walking data.
const getWalkingData = () => {

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "${measurements.walking}" and
            r.${tags.device} == "${devices.device_1}" and 
            r._field == "${fields.minutes}")
        |> last()`;


        let results = [];

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                results.push({ time, value });
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess')
                resolve(results);
            },
        });
    });
}

// Get jogging data.
const getJoggingData = () => {

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "${measurements.jogging}" and
            r.${tags.device} == "${devices.device_1}" and 
            r._field == "${fields.minutes}")
        |> last()`;

        let results = [];

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                results.push({ time, value });
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess')
                resolve(results);
            },
        });
    });
}


// Get steps.
const getSteps = () => {

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: -5d)
        |> filter(fn: (r) => r._measurement == "${measurements.steps}" and
            r.${tags.device} == "${devices.device_1}" and 
            r._field == "${fields.steps}")
        |> window(every: 1d)
        |> last()`;

        let results = {
            labels: [],
            data: []
        };

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                // Convert the time to a Date object
                const date = new Date(time);

                // Format the date (e.g., YYYY-MM-DD)
                const formattedDate = date.toISOString().split('T')[0];

                console.log('Date:', formattedDate, 'Value:', value);

                results.labels.push(formattedDate);
                results.data.push(value);
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess')
                resolve(results);
            },
        });
    });
}


// Get biking data.
const getBikingData = () => {

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "${measurements.biking}" and
            r.${tags.device} == "${devices.device_1}" and 
            r._field == "${fields.minutes}")
        |> last()`;

        let results = [];

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                results.push({ time, value });
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess')
                resolve(results);
            },
        });
    });
}


// Get idling data.
const getIdlingData = () => {

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "${measurements.idling}" and
            r.${tags.device} == "${devices.device_1}" and 
            r._field == "${fields.minutes}")
        |> last()`;


        let results = [];

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                results.push({ time, value });
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess')
                resolve(results);
            },
        });
    });
}

// Get heart beat rate
const getOxygenSaturationData = () => {

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => 
            r._measurement == "${measurements.oxygen}" and
            r.${tags.device} == "${devices.device_1}"
        )`;

        let results = {
            labels: [],
            data: []
        };

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                const { _time: time, _value: value } = tableObject;
                results.labels.push(extractTimeHHMMSS(time));
                results.data.push(value)
            },
            error: (error) => {
                console.error('\nError', error);
                reject(error);
            },
            complete: () => {
                console.log('\nSuccess');
                resolve(results);
            },
        });
    });
}


module.exports = { 
    getAllData, 
    getHeartBeatRate, 
    getTemperature, 
    getAction, 
    getSound,
    getSleepData,
    getWalkingData,
    getJoggingData,
    getSteps,
    getBikingData,
    getIdlingData,
    getOxygenSaturationData
};