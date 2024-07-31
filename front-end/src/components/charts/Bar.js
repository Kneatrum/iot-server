import {Bar} from 'react-chartjs-2'
import { useContext, useEffect, useState } from 'react';
import { ApiContext } from '../../context/ApiContext';

import {
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement,
    Title,
    Tooltip,
    Legend
);

function BarChart(){
    const { dashboardData } = useContext(ApiContext);
    const [ chartData, setChartData ] = useState(null);

    useEffect(() => {
        if(dashboardData.stepsData){
            setChartData(dashboardData.stepsData)
        }
    }, [dashboardData]);

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: "bottom"
            }
        },
        scales: {
            y: {
                display: true,
                title: {
                    display: false,
                    text: "Steps" // x-axis label
                },
                ticks: {
                    stepSize: 1000
                },
                grid: {
                    offset: false
                }
            },
            x: {
                title: {
                    display: true,
                    text: "Days" // y-axis label
                },
                grid: {
                    offset: true
                }
            } 
        }
    };

    return( 
        <div className="card" style={{  borderRadius: '10px', marginTop: '20px', height: '390px' }}>
            <div className="card-header">
                <h5>Steps</h5>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
                { 
                chartData ? (
                    <Bar options={options} data={chartData} style={ {marginRight: '10%', height: '80%'} } />
                ): (
                    <p>Loading...</p>
                )
                }
            </div>
        </div>
    );
};

export default BarChart;