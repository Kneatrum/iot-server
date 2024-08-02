import {Bar} from 'react-chartjs-2'
import { useContext, useEffect, useState } from 'react';
import { ApiContext } from '../../context/ApiContext';
// import 'chartjs-adapter-date-fns';

import {
    Chart as ChartJS, 
    TimeScale, 
    LinearScale, 
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement
} from 'chart.js'

ChartJS.register(
    TimeScale, 
    LinearScale, 
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement
);

function BarChart(){
    const { dashboardData } = useContext(ApiContext);
    const [ chartData, setChartData ] = useState(null);

    useEffect(() => {
        if(dashboardData.stepsData){
            setChartData(dashboardData.stepsData);
        }
    }, [dashboardData]);

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "top"
            }
        },
        scales: {
            y: {
                title: {
                    display: false,
                    text: "Steps" // x-axis label
                },
                ticks: {
                    stepSize: 100
                }
            },
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                },
                title: {
                    display: true,
                    text: "Days" // y-axis label
                }
            } 
        }
        
    };
    console.log(chartData)
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