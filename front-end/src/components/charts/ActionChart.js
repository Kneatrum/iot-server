import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Legend, Tooltip } from 'chart.js';
import { useEffect, useState, useContext, useRef } from 'react';
import { LittleCard } from '../Cards';
import { ApiContext } from '../../context/ApiContext';

ChartJS.register(
  ArcElement,
  Legend,
  Tooltip
);

const data_label = "Activity Summary";
const loadingLabel = "Loading...";

function PieChart() {
  const { dashboardData } = useContext(ApiContext);
  const [pieChartData, setPieChartData] = useState(null);
  const [progressData, setProgressData] = useState({
    sleeping: 0,
    idling: 0,
    walking: 0,
    jogging: 0,
    biking: 0
  });

  const chartRef = useRef(null);

  useEffect(() => {
    if (dashboardData.actionChartData) {
      // Create a new reference for the chart data to ensure React detects the change
      const newPieChartData = { 
        ...dashboardData.actionChartData, 
        datasets: dashboardData.actionChartData.datasets.map(dataset => ({
          ...dataset,
          data: [...dataset.data]  // Ensure the data array has a new reference
        }))
      };

      setPieChartData(newPieChartData);

      const dataset = dashboardData.actionChartData.datasets[0].data;

      setProgressData({
        sleeping: dataset[0] > 0 ? dataset[0] : 0,
        idling: dataset[1] > 0 ? dataset[1] : 0,
        walking: dataset[2] > 0 ? dataset[2] : 0,
        jogging: dataset[3] > 0 ? dataset[3] : 0,
        biking: dataset[4] > 0 ? dataset[4] : 0
      });
    }
  }, [dashboardData]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [pieChartData]);

  const options = {
    plugins: {
      legend: {
        display: false,
        position: 'bottom'
      }
    }
  };

  return (
    <div className="card" style={{ borderRadius: '10px', height: '800px' }}>
      <div className="card-header">
        <h5>{data_label}</h5>
      </div>
      <div className="card-body d-flex justify-content-center align-items-center">
        {pieChartData ? (
          <Doughnut
            ref={chartRef}
            options={options}
            data={pieChartData}
          />
        ) : (
          <p>{loadingLabel}</p>
        )}
      </div>
      <LittleCard title="Sleeping" progress={progressData.sleeping} color="orange" />
      <LittleCard title="Idling" progress={progressData.idling} color="blue" />
      <LittleCard title="Walking" progress={progressData.walking} color="green" />
      <LittleCard title="Jogging" progress={progressData.jogging} color="red" />
      <LittleCard title="Biking" progress={progressData.biking} color="purple" />
    </div>
  );
}

export default PieChart;
