import { Line } from 'react-chartjs-2'
import { useContext, useState, useEffect } from 'react';
import { ApiContext } from '../../context/ApiContext';
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
    const { dashboardData } = useContext(ApiContext);
    const [ chartData, setChartData ] = useState(null);

    useEffect(() => {
        if(dashboardData.heartOxygenData){
            // console.log(dashboardData.heartOxygenData)
            setChartData(dashboardData.heartOxygenData);
        }
    }, [dashboardData.heartOxygenData]);

    const options = {
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
                time: {
                    unit: 'hour'
                },
                title: {
                    display: true,
                    text: "Time" // y-axis label
                },
                ticks: {
                    stepSize: 1
                }
            } 
        }
    }
    
    return(
        <div className="card" style={{  borderRadius: '10px', marginTop: '20px', height: '390px' }}>
            <div className="card-header">
                <h5>Heart rate and blood oxygen saturation</h5>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
                {chartData ? (
                    <Line options={options} data={chartData} />
                ):(
                    <p>Loading...</p>
                )}
            </div>
        </div> 
    );
}

export default HeartChart;