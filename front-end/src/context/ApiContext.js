import React, { createContext, useEffect, useState } from "react"; 
import axios from 'axios';


export const ApiContext = createContext();

const localhost = "localhost"
// const servicename = "servicename"
const backEndHost = localhost;
const backEndPort = 3000;


function populateChartLabelsAndValues(input_data){
    if(input_data === null) return;

    input_data.forEach(obj => {
        // Extract time in hh:mm:ss format
        const time = obj.time.slice(11, 19);
        dashboard.sleepChartData.labels.push(time);
    
        // Extract value
        const value = obj.value;
        dashboard.sleepChartData.datasets[0].data.push(value);
    });
}

let dashboard = {
    nightSleep: 0,
    avgHeartRate: 0,
    avgOxygenSaturation: 0,
    avgTemp: 0,
    steps: 0,
    sleepChartData: {
        labels: [],
        datasets: [
            {
                label: "Time",
                data: [],
                borderColor: "orange"
            },
        ],
    },
    actionChartData: {
        labels: [],
        datasets: [
            {
                label: "",
                data: [],
                backgroundColor: [
                    "orange",
                    "blue",
                    "green",
                    "red",
                    "purple"
                ],
                hoverOffset: 5
            },
        ],
    },
    heartRateData: null,
    stepsData: null,
    heartOxygenData: {
        labels: [],
        datasets: [
            {
                label: "Heart rate (bpm)",
                data: [],
                backgroundColor: "green"
            },
            {
                label: "Oxygen Saturation (%)",
                data: [],
                backgroundColor: "pink"
            }
        ]
    },

    action :{
        sleeping: { percentage: 0, duration: 0 },
        idling: { percentage: 0, duration: 0 },
        walking: { percentage: 0, duration: 0 },
        jogging: { percentage: 0, duration: 0 },
        biking: { percentage: 0, duration: 0 }
    },

    sleep: {
        awake: { duration: 0, percentage: 0 },
        light: { duration: 0, percentage: 0 },
        rem: { duration: 0, percentage: 0 },
        deep: { duration: 0, percentage: 0 }
    },

    totalSleepTime: 0
}

function toFixedNumber(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

const getPercentages = (actions) => {
    return Object.values(actions).map(action => action.percentage);
};

function calculateAndSetActivitySummary(input){
    let totalTime = 0;
    const isNumber = (value) => typeof value === 'number';

    // If there is valid data from the api queries, get the duration of each activity and assign it to the dashboard data
    if(input.idling && input.idling.data.length !== 0){
        dashboard.action.idling.duration = input.idling.data[0].value;
    }

    if(input.walking && input.walking.data.length !== 0){
        dashboard.action.walking.duration = input.walking.data[0].value;
    }

    if(input.jogging && input.jogging.data.length !== 0){
        dashboard.action.jogging.duration = input.jogging.data[0].value;
    }

    if(input.biking && input.biking.data.length !== 0){
        dashboard.action.biking.duration = input.biking.data[0].value;
    }
        
    // Add time (in minutes) from each action to come up with the total
    Object.values(dashboard.action).forEach(element => {
        if (isNumber(element.duration)){
            totalTime += element.duration;
        }
    });

    // Calculate the percentage based on time spent per activity and the total time spent on all activities
    Object.values(dashboard.action).forEach(element => {
        if (isNumber(element.duration) && element.duration > 0){
            element.percentage = toFixedNumber(((element.duration / totalTime) * 100), 1);
        }
    });

    // Assign the percentages of all actions to the chart information for display
    dashboard.actionChartData.datasets[0].data = getPercentages(dashboard.action);
}

function calculateAndFillSleepSummary(dbQueryResults){
    if(dbQueryResults.timeBreakdown === null) return;

    const states = dbQueryResults.timeBreakdown.states;

    let sleepDuration = dbQueryResults.timeBreakdown.totalTime;
    dashboard.nightSleep = sleepDuration;
    dashboard.totalSleepTime = sleepDuration;
    dashboard.action.sleeping.duration = sleepDuration;

    for(let state in states){
        if (states.hasOwnProperty(state)){
            dashboard.sleep[state].duration = states[state].time;
            dashboard.sleep[state].percentage = states[state].percentage;
        }
    }
}

// function setHeartData(heartData){
//     if(heartData){
//         dashboard.heartRateData = heartData
//         const sum = heartData.data.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
//         const average = sum / heartData.data.length;
//         console.log('Average:', average);
//         dashboard.avgHeartRate = average.toFixed(0);
//     }
// }

// function setOxygenSaturationData(oxygenData){
//     if(oxygenData){
//         dashboard.oxygenSaturationData.labels = oxygenData.labels;
//         dashboard.oxygenSaturationData.datasets[0].data = oxygenData.datasets[0].data;
//     }
// }

function setHeartAndOxygenData(data){
    if(data.heartRate && data.oxygenSaturation){
        data.heartRate.labels.forEach(element =>{
            dashboard.heartOxygenData.labels.push(element)
        })
        data.oxygenSaturation.data.forEach(element => {
            dashboard.heartOxygenData.datasets[0].data.push(element)    
        })
        data.heartRate.data.forEach(element => {
            dashboard.heartOxygenData.datasets[1].data.push(element)
        })

        dashboard.avgHeartRate = findAverage(data.heartRate.data);
        dashboard.avgOxygenSaturation = findAverage(data.oxygenSaturation.data);
        
    }
}

function findAverage(strArray){
    const intArray = strArray.map(str => parseInt(str, 10));
    const sum = intArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const average = sum / intArray.length;
    return average.toFixed(0)
}


function setStepsData(stepsData){
    if(stepsData){
        dashboard.stepsData = stepsData;
        if(dashboard.stepsData.datasets[0].data.length > 0){
            dashboard.steps = dashboard.stepsData.datasets[0].data[dashboard.stepsData.datasets[0].data.length - 1]
        }
    }
}

export const ApiProvider = (props) => {
    const [data, setData] = useState({sleep: null, idling: null, walking: null, jogging: null, steps: null, biking: null, oxygen: null});
    const [dashboardData, setDashboardData] = useState(dashboard);
    
    useEffect(() => {
        const urls = [
            "http://" + backEndHost + ":" + backEndPort + "/sleep",
            "http://" + backEndHost + ":" + backEndPort + "/idling",
            "http://" + backEndHost + ":" + backEndPort + "/walking",
            "http://" + backEndHost + ":" + backEndPort + "/jogging",
            "http://" + backEndHost + ":" + backEndPort + "/steps",
            "http://" + backEndHost + ":" + backEndPort + "/biking",
            "http://" + backEndHost + ":" + backEndPort + "/heart",
            "http://" + backEndHost + ":" + backEndPort + "/oxygen"
        ];

        const fetchData = async () => {
            try {
                const responses = await Promise.all(urls.map(url => axios.get(url)));
                const [sleepData, idlingData, walkingData, joggingData, stepsData, bikingData, heart, oxygen] = responses.map(response => response.data);
                setData({
                    sleep: sleepData,
                    idling: idlingData,
                    walking: walkingData,
                    jogging: joggingData,
                    steps: stepsData,
                    biking: bikingData,
                    heartRate: heart,
                    oxygenSaturation: oxygen
                });
            } catch (err) {
                console.error("Error fetching data:", err.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (data) {
            if (data.sleep) {
                populateChartLabelsAndValues(data.sleep.chartData);
                calculateAndFillSleepSummary(data.sleep);
            }
            calculateAndSetActivitySummary(data);
            setHeartAndOxygenData(data);
            setStepsData(data.steps);
            setDashboardData({ ...dashboard });
        } 
    }, [data]);

    //  console.log(dashboard)
                    
    return (
        <ApiContext.Provider value={ {dashboardData} }>
            { props.children }
        </ApiContext.Provider>
    );
};
