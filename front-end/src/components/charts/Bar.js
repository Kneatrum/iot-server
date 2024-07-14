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
        
    };

    return( 
        <div className="card" style={{  borderRadius: '10px', marginTop: '20px', height: '350px' }}>
            <div className="card-header">
                <h5>Steps</h5>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
                { 
                chartData ? (
                    <Bar options={options} data={chartData} />
                ): (
                    <p>Loading...</p>
                )
                }
            </div>
        </div>
    );
};

export default BarChart;