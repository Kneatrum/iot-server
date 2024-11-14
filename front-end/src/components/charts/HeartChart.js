import { Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns';

import {
    Chart as ChartJS, 
    TimeScale, 
    LinearScale, 
    PointElement, 
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(
    TimeScale, 
    LinearScale, 
    PointElement, 
    LineElement,
    Title,
    Tooltip,
    Legend
);


function HeartChart(){
    const chartData = {
        "datasets": [
            {
                "label": "Line chart",
                "data": [
                    { "x": 1728172800000, "y": 65 },
                    { "x": 1728173400000, "y": 50 },
                    { "x": 1728174000000, "y": 40 },
                    { "x": 1728174600000, "y": 75 },
                    { "x": 1728175200000, "y": 55 },
                    { "x": 1728175800000, "y": 80 },
                    { "x": 1728176400000, "y": 30 }
                ],
                "borderColor": "rgba(75,192,192,1)",
                "backgroundColor": "rgba(75,192,192,0.2)"
            }
        ]
    }
    

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top"
            }
        },
        scales: {
            y: {
                display: true,
                title: {
                    display: false,
                    text: "Beats per minute" // x-axis label
                },
                ticks: {
                    stepSize: 5
                }
            },
            x: {
                type: 'time',
                grid: {
                    display: false
                },
                time: {
                    unit: 'minute',
                    stepSize: 10,
                    min: new Date('2024-10-06T04:00:00').getTime(),  // Start time (replace with dynamic start if needed)
                    max: new Date('2024-10-06T05:00:00').getTime(),  // End time (1-hour window)
                    displayFormats: {
                        minute: 'HH:mm'
                    }
                },
                title: {
                    display: true,
                    text: "Time" // y-axis label
                },
                ticks: {
                    source: 'auto',  // Automatically generate ticks based on time units
                    autoSkip: false  // Ensures 6 divisions appear (no skipping)
                }
            } 
        }
    }
    
    return(
        // <div className="card" style={{  borderRadius: '10px', marginTop: '20px', height: '390px', marginBottom: '30px' }}>
        //     <div className="card-header">
        //         <h5>Heart rate and blood oxygen saturation</h5>
        //     </div>
        //     <div className="card-body d-flex justify-content-center align-items-center">
        <>
            {
                chartData ? (
                    <Line options={options} data={chartData} />
                ):(
                    <p>Loading...</p>
                )
            }
        </>
        //     </div>
        // </div> 
    );
}

export default HeartChart;