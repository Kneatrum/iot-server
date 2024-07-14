import { Line } from 'react-chartjs-2'
import { useContext, useState, useEffect } from 'react';
import { ApiContext } from '../../context/ApiContext';


import {
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement,
    Title,
    Tooltip,
    Legend
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





function SleepingLine(){
    const { dashboardData } = useContext(ApiContext);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        if(dashboardData.sleepChartData){
            setChartData(dashboardData.sleepChartData);  
        }
    }, [dashboardData]);



    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
            }
        },
        scales: {
            x: {
                // min: 0,
                // max: 12,
                display: false,
                title: {
                    display: false,
                    text: "Time"
                },
                ticks: {
                    stepSize: 1
                }
            },
            y: {
                min: -0.5,
                max: 3.5,
                title: {
                    display: false,
                    text: "Sleep Stage"
                },
                ticks: {
                    callback: function(value) {
                        if (value === 3) return 'Awake';
                        if (value === 2) return 'REM Sleep';
                        if (value === 1) return 'Light Sleep';
                        if (value === 0) return 'Deep Sleep';
                    }
                }
            }
        }
    };

    
    return( 
        <div className="card" style={{  borderRadius: '10px', height: '380px' }}>
            <div className="card-header">
                <h5>Sleep data</h5>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
                {
                    chartData ? (
                        <Line options={options} data={chartData} />
                    ):(
                        <p>Loading...</p>
                    )
                }
            </div>
        </div>
    );
};

export default SleepingLine;


