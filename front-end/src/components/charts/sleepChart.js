import {Line} from 'react-chartjs-2'
// import axios from 'axios';
// import { useEffect, useState } from 'react';


import {
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement,
    Title,
    Tooltip,
    Legend
);

const sleepData = {
    labels: [
        '22:12', '23:00', '23:30', '00:00', '00:30', '01:00', 
        '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', 
        '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', 
        '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', 
        '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', 
        '13:30', '14:00', '14:30', '15:01'
    ],
    datasets: [
        {
            label: 'Awake',
            data: [
                0, 0, 1, 1, 2, 2, 0, 0, 2, 2, 
                1, 1, 2, 2, 1, 1, 2, 2, 0, 0, 
                2, 2, 1, 1, 2, 2, 1, 1, 2, 2, 
                0, 0, 2, 2
            ],
            backgroundColor: 'rgba(255, 165, 0, 0.5)',
            borderColor: 'rgba(255, 165, 0, 1)',
            borderWidth: 1,
            fill: true,
            stepped: true,
            spanGaps: true
        },
        {
            label: 'Light Sleep',
            data: [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
                1, 1, 1, 1
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            fill: true,
            stepped: true,
            spanGaps: true
        },
        {
            label: 'Deep Sleep',
            data: [
                2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 
                2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 
                2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 
                2, 2, 2, 2
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            fill: true,
            stepped: true,
            spanGaps: true
        }
    ]
};

function SleepChart() {

    const options = {
        responsive: true,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Sleep Stage'
                },
                ticks: {
                    callback: function(value) {
                        if (value === 0) return 'Awake';
                        if (value === 1) return 'Light Sleep';
                        if (value === 2) return 'Deep Sleep';
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }

    return(
        <div className="card" style={{  borderRadius: 0 }}>
            <div className="card-header">
                <h5>Sleep data</h5>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
                {sleepData ? (
                    <Line options={options} data={sleepData} />
                ):(
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default SleepChart;

