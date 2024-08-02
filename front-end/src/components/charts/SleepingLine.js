import { Line } from 'react-chartjs-2'
import { useContext, useState, useEffect } from 'react';
import { ApiContext } from '../../context/ApiContext';
import { Chart, registerables } from 'chart.js';
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

Chart.register(...registerables);


const flatLineWidthPlugin = {
    id: 'flatLineWidthPlugin',
    afterDatasetDraw: function(chart, args, options) {
      const { ctx, data } = chart;
      const meta = chart.getDatasetMeta(0); // Assuming you're working with the first dataset
      const { data: points } = meta;
      
      
      ctx.save();
  
      for (let i = 0; i < points.length - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];
  
        const deltaX = nextPoint.x - currentPoint.x;
        const deltaY = nextPoint.y - currentPoint.y;
  
        // Check if the segment is flat
        if (deltaY === 0) {
          // Draw the flat line segment with increased thickness
          ctx.beginPath();
          ctx.lineWidth = options.flatLineWidth || 5; // Use the provided width or default to 5
          ctx.strokeStyle = currentPoint.options.borderColor || options.borderColor || 'black';
          ctx.moveTo(currentPoint.x, currentPoint.y);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          ctx.stroke();
          ctx.closePath();
        }
      }
  
      ctx.restore();
    }
  };

Chart.register(flatLineWidthPlugin);


function SleepingLine(){
    const { dashboardData } = useContext(ApiContext);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        if(dashboardData.sleepChartData){
            setChartData(dashboardData.sleepChartData);  
        }
    }, [dashboardData]);

    const data = {
            labels: [
                '2024-08-01T13:00:00', 
                '2024-08-01T13:05:00', 

                '2024-08-01T13:05:00', 
                '2024-08-01T13:15:00',

                '2024-08-01T13:15:00',
                '2024-08-01T13:20:00',

                '2024-08-01T13:20:00'
            ],
        datasets: [
            {
                label: "Time",
                data: [ 3, 3, 2, 2, 1, 1, 0],
                borderColor: 'orange'
            },
        ],
    }



    const options = {
        responsive: true,
        plugins: {

            flatLineWidthPlugin: {
                flatLineWidth: 25 // Set the custom line width for flat segments
                // borderColor: 'red' // Optional custom color for flat segments
            },
              
            legend: {
                display: false,
                position: "bottom",
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'hour',
                    stepSize: 1 // 24 hours (1 day)
                },

                // min: 0,
                // max: 12,
                display: true,
                title: {
                    display: true,
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
        <div className="card" style={{  borderRadius: '10px', height: '390px' }}>
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


