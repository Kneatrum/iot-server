


data = {
    chartData: [
        {
            time: "2024-06-13T05:13:36.9034067Z",
            value: 3
        },
        {
            time: "2024-06-13T05:13:41.9109375Z",
            value: 3
        },
        {
            time: "2024-06-13T05:13:41.9111228Z",
            value: 3
        },
        {
            time: "2024-06-13T05:13:46.8973752Z",
            value: 3
        },
        {
            time: "2024-06-13T05:13:46.8974562Z",
            value: 1
        },
        {
            time: "2024-06-13T05:13:51.9040294Z",
            value: 1
        },
        
    ],
    timeBreakdown: {
        states: {
            awake: {
                time: "2.4 min",
                percentage: "29.3"
            },
            light: {
                time: "2.3 min",
                percentage: "28.3"
            },
            rem: {
                time: "1.6 min",
                percentage: "19.2"
            },
            deep: {
                time: "1.9 min",
                percentage: "23.2"
            }
        },
        totalTime: "8.3 min"
    }
}


let dashboard = {
    nightSleep: 0,
    avgHeartRate: 0,
    avgTemp: 0,
    steps: 0,

    action :{
        sleeping: { percentage: 0, duration: 0 },
        idle: { percentage: 0, duration: 0 },
        walking: { percentage: 0, duration: 0 },
        jogging: { percentage: 0, duration: 0 },
        biking: { percentage: 0, duration: 0 }
    },

    sleep: {
        awake: { duration: 0, percentage: 0 },
        light: { duration: 0, percentage: 0 },
        rem: { duration: 0, percentage: 0 },
        deep: { duration: 0, percentage: 0 }
    }
}


function setSleepSummary(input){
    const states = input.timeBreakdown.states;
    let sleepingDuration = input.timeBreakdown.totalTime;
    for(let state in states){
        if (states.hasOwnProperty(state)){
            console.log(state)
            dashboard.sleep[state].duration = states[state].time;
            dashboard.sleep[state].percentage = states[state].percentage;
        }
    }
    dashboard.totalSleepTime = sleepingDuration;
    dashboard.nightSleep = sleepingDuration;
    dashboard.action.sleeping.duration = sleepingDuration
}

setSleepSummary(data);
console.log(dashboard);

