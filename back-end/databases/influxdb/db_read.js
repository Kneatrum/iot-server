const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});

const { InfluxDB } = require('@influxdata/influxdb-client');
const { measurements, devices, tags, fields} = require('../../constants');





let bucket;
let queryClient;

const sleepStates = ['deep', 'light', 'rem', 'awake'];


function initializeReadClient(arg_url, arg_token, arg_organisation, arg_bucket) {
    url = arg_url;
    token = arg_token;
    org = arg_organisation;
    bucket = arg_bucket;
    let client = new InfluxDB({ url, token });
    queryClient = client.getQueryApi(org);
}
  

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
const getHeartBeatRate = (startDate) => {

    let now =  new Date().toISOString()
    let query = null;
    if(startDate === 0){
        query =  `start: ${startDate}`
    } else {
        query =  `start: ${startDate}, stop: ${now}`
    }

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(${query})
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
                results.labels.push(time);
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
const getTemperature = (startDate) => {

    let now =  new Date().toISOString()
    let query = null;
    if(startDate === 0){
        query =  `start: ${startDate}`
    } else {
        query =  `start: ${startDate}, stop: ${now}`
    }

    return new Promise((resolve, reject) => {
        console.log("Start")
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(${query})
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
const getAction = (startDate) => {

    let now =  new Date().toISOString()
    let query = null;
    if(startDate === 0){
        query =  `start: ${startDate}`
    } else {
        query =  `start: ${startDate}, stop: ${now}`
    }

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(${query})
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
const getSound = (startDate) => {

    let now =  new Date().toISOString()
    let query = null;
    if(startDate === 0){
        query =  `start: ${startDate}`
    } else {
        query =  `start: ${startDate}, stop: ${now}`
    }

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(${query})
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
const getSleepData = (numDays) => {

    let days = +numDays; // Checking if the days parameter is a digit

    if (isNaN(days)){
        console.log("Please add a valid parameter\nUsing 0 as the default");
        days = 0;
    }

    // Add a default negative sign if days is not '0'
    const optionalNegSign = days === 0 ? '' : '-';
    let param = null;

    if(days === 0 ){
        param = `${optionalNegSign}${days}`
    } else {
        param = `${optionalNegSign}${days}d`
    }

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: ${param})
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
const getWalkingData = (startDate) => {

    let now =  new Date().toISOString()
    let query = null;
    if(startDate === 0){
        query =  `start: ${startDate}`
    } else {
        query =  `start: ${startDate}, stop: ${now}`
    }

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(${query})
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
const getJoggingData = (startDate) => {

    let now =  new Date().toISOString()
    let query = null;
    if(startDate === 0){
        query =  `start: ${startDate}`
    } else {
        query =  `start: ${startDate}, stop: ${now}`
    }

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(${query})
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
const getSteps = (numDays) => {

    let days = +numDays; // Checking if the days parameter is a digit

    if (isNaN(days)){
        console.log("Please add a valid parameter\nUsing 0 as the default");
        days = 0;
    }

    // Add a default negative sign if days is not '0'
    const optionalNegSign = days === 0 ? '' : '-';
    let param = null;

    if(days === 0 ){
        param = `${optionalNegSign}${days}`
    } else {
        param = `${optionalNegSign}${days}d`
    }
    

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(start: ${param})
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

                results.labels.push(date);
                results.data.push(value);
            },
            error: (error) => {
                console.error('\nError', error)
                reject(error);
            },
            complete: () => {
                resolve(results);
            },
        });
    });
}


// Get biking data.
const getBikingData = (startDate) => {

    let now =  new Date().toISOString()
    let query = null;
    if(startDate === 0){
        query =  `start: ${startDate}`
    } else {
        query =  `start: ${startDate}, stop: ${now}`
    }

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(${query})
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
const getIdlingData = (startDate) => {

    let now =  new Date().toISOString()
    let query = null;
    if(startDate === 0){
        query =  `start: ${startDate}`
    } else {
        query =  `start: ${startDate}, stop: ${now}`
    }

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(${query})
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
const getOxygenSaturationData = (startDate) => {
    

    let now = new Date()
    now = now.toISOString()
    let query =  `start: ${startDate}, stop: ${now}`

    return new Promise((resolve, reject) => {
        let fluxQuery = `from(bucket: "${bucket}")
        |> range(${query})
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
                results.labels.push(time);
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
    getOxygenSaturationData,
    initializeReadClient
};