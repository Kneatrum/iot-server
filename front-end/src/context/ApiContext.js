import React, { createContext, useEffect, useState } from "react"; 
import axios from 'axios';

export const ApiContext = createContext();

function populateChartLabelsAndValues(input_data){
    if(input_data.chartData === null) return;

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
    avgTemp: 0,
    steps: 0,
    sleepChartData: {
        labels: [],
        datasets: [
            {
                label: "",
                data: [],
                borderColor: ""
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

function setHeartData(heartData){
    if(heartData){
        dashboard.heartRateData = heartData
        const sum = heartData.datasets[0].data.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const average = sum / heartData.datasets[0].data.length;
        console.log('Average:', average);
        dashboard.avgHeartRate = average.toFixed(0);
    }
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
    const [data, setData] = useState({sleep: null, idling: null, walking: null, jogging: null, steps: null, biking: null});
    const [dashboardData, setDashboardData] = useState(dashboard);
    
    useEffect(() => {
        const urls = [
            "http://localhost:3000/sleep",
            "http://localhost:3000/idling",
            "http://localhost:3000/walking",
            "http://localhost:3000/jogging",
            "http://localhost:3000/steps",
            "http://localhost:3000/biking",
            "http://localhost:3000/heart"
        ];

        const fetchData = async () => {
            try {
                const responses = await Promise.all(urls.map(url => axios.get(url)));
                const [sleepData, idlingData, walkingData, joggingData, stepsData, bikingData, heart] = responses.map(response => response.data);
                setData({
                    sleep: sleepData,
                    idling: idlingData,
                    walking: walkingData,
                    jogging: joggingData,
                    steps: stepsData,
                    biking: bikingData,
                    heartRate: heart
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
                // console.log(data.sleep)
                populateChartLabelsAndValues(data.sleep.chartData);
                calculateAndFillSleepSummary(data.sleep);
            }
            calculateAndSetActivitySummary(data);
            setHeartData(data.heartRate);
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
