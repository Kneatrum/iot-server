import React, { createContext, useEffect, useState } from "react"; 
import axios from 'axios';


export const ApiContext = createContext();

const numOfstepsQueryDays = 5; // Getting the steps in the last 5 days
const today = new Date("2024-08-01");
let startDate =  new Date(today.setHours(0, 0, 0, 0)).toISOString();
let numOfSleepQueryDays = 6;

const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'; 
console.log("###############")
console.log(baseURL)
console.log("###############")
const heartRateColor = "lightsalmon";
const oxygenSaturation = "lightskyblue";

const stepsBarColor = "blue";

const sleepColor = "orange";
const idlingColor = "blue";
const walkingColor = "green";
const joggingColor = "red";
const bikingColor =  "purple";

function populateSleepChartLabelsAndValues(input_data){
    if(input_data === null) return;

    input_data.forEach(obj => {
        // Extract time
        const time = obj.time;
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
                borderColor: sleepColor
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
                    sleepColor,
                    idlingColor,
                    walkingColor,
                    joggingColor,
                    bikingColor
                ],
                hoverOffset: 5
            },
        ],
    },
    heartRateData: null,
    stepsData: {
        labels: [],
        datasets: [
            {
                label: "Steps",
                data: [],
                backgroundColor: stepsBarColor,
                borderColor: 'rgb(255, 99, 132, 0)', // This removes a top bar that appears on bars of the same height. Not sure why it appears
            }
        ]
    },
    heartOxygenData: {
        labels: [],
        datasets: [
            {
                label: "Heart rate (bpm)",
                data: [],
                backgroundColor: heartRateColor,
                borderColor: heartRateColor
            },
            {
                label: "Oxygen Saturation (%)",
                data: [],
                backgroundColor: oxygenSaturation,
                borderColor: oxygenSaturation,
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
    if(strArray.length === 0) return 0; // If we don't have any data, return 0. No need to proceed.
    const intArray = strArray.map(str => parseInt(str, 10));
    const sum = intArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const average = sum / intArray.length;
    return average.toFixed(0)
}







function setStepsData(stepsData){
    if(stepsData){
        const max_step_days = numOfstepsQueryDays;
        let extracted_dates = [];
        dashboard.steps = stepsData.data[stepsData.data.length - 1]
        
        stepsData.labels.forEach(date_time => {
            extracted_dates.push(date_time.split('T')[0])
        })


        let length_of_extrated_dates = extracted_dates.length;
        let difference = max_step_days - length_of_extrated_dates;
        if(length_of_extrated_dates < max_step_days){
            let first_extracted_date = extracted_dates[0];
            let date_format = new Date(first_extracted_date);

            for(let x = 0; x < difference; x++){
                let year = date_format.getFullYear();
                let month = (date_format.getMonth() + 1).toString().padStart(2, '0'); // 1 is added because the getMonth() function returns the month with a base of 0. That is 0 representing January
                let day = (date_format.getDate() - (difference - x)).toString().padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                
                dashboard.stepsData.labels.push(formattedDate);
                dashboard.stepsData.datasets[0].data.push(0);
            }

            extracted_dates.forEach(date => {
                dashboard.stepsData.labels.push(date)
            })

            stepsData.data.forEach(element => {
                dashboard.stepsData.datasets[0].data.push(element)
            })

            console.log(dashboard.stepsData.labels)

        } else {

            stepsData.labels.forEach(date => {
                dashboard.stepsData.labels.push(date.split('T')[0])
            });

            stepsData.data.forEach(element => {
                dashboard.stepsData.datasets[0].data.push(element)
            });
        }
        
    }
}

export const ApiProvider = (props) => {
    const [data, setData] = useState({sleep: null, idling: null, walking: null, jogging: null, steps: null, biking: null, oxygen: null});
    const [dashboardData, setDashboardData] = useState(dashboard);
    // const [baseURL, setBaseURL] = useState('');
    // setBaseURL(`http://localhost/api`);

    // useEffect(() => {
    //     // Fetch the public IP address using an IP service
    //     fetch('https://api.ipify.org?format=json')
    //       .then(response => response.json())
    //       .then(data => {
    //         setBaseURL(`http://${data.ip}/api`);
    //       })
    //       .catch(error => {
    //         console.error("Error fetching the public IP:", error);
    //       });
    //   }, []);

    
    useEffect(() => {


        const urls = [
            `${baseURL}/api/sleep/${numOfSleepQueryDays}`,
            `${baseURL}/api/idling/${startDate}`,
            `${baseURL}/api/walking/${startDate}`,
            `${baseURL}/api/jogging/${startDate}`,
            `${baseURL}/api/steps/${numOfstepsQueryDays}`,
            `${baseURL}/api/biking/${startDate}`,
            `${baseURL}/api/heart/${startDate}`,
            `${baseURL}/api/oxygen/${startDate}`
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
                populateSleepChartLabelsAndValues(data.sleep.chartData);
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
