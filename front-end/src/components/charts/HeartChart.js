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


function HeartChart(){
    const { dashboardData } = useContext(ApiContext);
    const [ chartData, setChartData ] = useState(null);

    useEffect(() => {
        if(dashboardData.heartRateData){
            setChartData(dashboardData.heartRateData);
        }
    }, [dashboardData.heartRateData]);

    const options = {
        
    }

    return(
        <div className="card" style={{  borderRadius: '10px', marginTop: '20px', height: '350px' }}>
            <div className="card-header">
                <h5>Heart data</h5>
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