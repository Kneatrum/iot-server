import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Legend, Tooltip, plugins } from "chart.js";
import { useEffect, useState } from 'react';


ChartJS.register(
  ArcElement, 
  Legend, 
  Tooltip,
)

const data_label = "Sleep Summary";
const loadingLabel = "Loading..."

const pie_data_prototype = [
  {
    name: 'Awake',
    action_data: 0,
    color: 'gray',
  }, 
  {
    name: 'Rem sleep',
    action_data: 0,
    color: 'magenta',
  },
  {
    name: 'Light sleep',
    action_data: 0,
    color: 'brown',
  },
  {
    name: 'Deep sleep',
    action_data: 0,
    color: 'orange'
  } 
];

function getTimeTrackerResults(api_query_results){

    let previous_object = null;
    let previous_time = null;
    let last_timestamp = null;
    let last_object = null;
    const pie_chart_labels = [];
    const pie_chart_colors = [];
    let time_tracker = {};
  
    pie_data_prototype.forEach(obj => {
      time_tracker[obj.name] = 0;
      pie_chart_labels.push(obj.name);
      pie_chart_colors.push(obj.color)
    })
  

    api_query_results.forEach(obj => {
        const current_time = new Date(obj.time);
        const current_object = obj;
        if (previous_time !== null){
            const timeDiffMinutes = (current_time - previous_time) / (1000 * 60); // Difference in minutes
            time_tracker[pie_chart_labels[previous_object.value]] += timeDiffMinutes
        } 
        previous_object = current_object;
        previous_time = current_time;
        last_timestamp = current_time;
        last_object = current_object
    });
  
    const timeDiffMinutes = (new Date() - last_timestamp) / (1000 * 60); // Difference in minutes
    time_tracker[pie_chart_labels[last_object.value]] += timeDiffMinutes
  
    const labels_values = Object.keys(time_tracker);
    const data_values = Object.values(time_tracker);
  
    const pie_chart_data = {
      labels: null,
      datasets: [
        {
          label: null,
          data: null,
          backgroundColor: null,
          hoverOffset: 0,
        }
      ]
    };
  
  
    pie_chart_data.labels = labels_values;
    pie_chart_data.datasets[0].label = data_label;
    pie_chart_data.datasets[0].data = data_values;
    pie_chart_data.datasets[0].backgroundColor = pie_chart_colors;
    pie_chart_data.datasets[0].hoverOffset = 10;
    return pie_chart_data
  }

function DoughnutChart(){
    const [ doughnutData, setDoughnutData ] = useState(null);

    useEffect(() => {
      // const url = "http://localhost:3000/sleep";
      const url = "http://localhost:3000/action"
      axios.get(url)
      .then(response => {
        const processedData = getTimeTrackerResults(response.data.data);
        setDoughnutData(processedData);
      })
      .catch(error => {
        console.error('Error fetching data:', error.message);
      });
    }, []);

    const options = {
      plugins: {
        legend: {
          display: false,
          position: 'bottom'
        }
      }
    }

    return (
      <div className="card" style={{ borderRadius: 0 }}>

        <div className="card-header">
          <h5>{data_label}</h5>
        </div>

        <div className="card-body d-flex justify-content-center align-items-center" >
          {doughnutData ? (
            <Doughnut options={options} data={doughnutData} />
          ) : (
            <p>{loadingLabel}</p>
          )}
        </div>
      </div>
    );
}

export default DoughnutChart;

