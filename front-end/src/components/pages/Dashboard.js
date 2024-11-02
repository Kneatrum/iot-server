import React, { useState, useEffect, useContext } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import DeviceToolbar from './DeviceToolbar.js';
import styles from '../styles/dashboard.module.css';
import axios from 'axios';
import gridcss from '../styles/grid.module.css'; 
import  chartTypes  from '../ChartTypes.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns';
import { v4 as uuidv4 } from 'uuid';
import  Modal  from '../Modal/Modal.js'
import { ApiContext } from '../../context/ApiContext';

import {
  Chart as ChartJS, 
  TimeScale, 
  LinearScale, 
  BarElement,
  ArcElement,
  PointElement, 
  LineElement,
  CategoryScale, 
  Title,
  Tooltip,
  Legend
} from 'chart.js'

const chartComponents = {
  Line: Line,
  Bar: Bar,
  Pie: Pie,
  Doughnut: Doughnut,
};

// import  HeartChart  from '../charts/HeartChart.js';

const backEndHost = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const url = `${backEndHost}/user/layout`

const maxNumCols = 12;
const windowWidth = 1800;
const rowHeight = 30;

ChartJS.register(
  TimeScale, 
  LinearScale, 
  BarElement,
  ArcElement,
  PointElement, 
  LineElement,
  CategoryScale, 
  Title,
  Tooltip,
  Legend
);


const Dashboard = () => {
  const [compactType, setCompactType] = useState('vertical');
  const [margin, setMargin] = useState([20, 20]);

  const [charts, setCharts] = useState([]);
  const [layout, setLayout] = useState([]);

  const [apiData, setApiData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [realTimeData, setRealTimeData] = useState([]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modalState, setModalState] = useState(false);
  const { apiData } = useContext(ApiContext);


  useEffect(() => {
    axios.get('https://6705c2e5031fd46a8310e215.mockapi.io/api/v1/chartData')
    .then(response => {
      setChartData( response.data[0]);
    })
    .catch(error => {
      console.error('Error fetching data:', error.message);
    });
  }, []);


  useEffect(() => {
    axios.get('https://6705c2e5031fd46a8310e215.mockapi.io/api/v1/iotData')
    .then(response => {
      setRealTimeData( response.data);
    })
    .catch(error => {
      console.error('Error fetching data:', error.message);
    });
  }, []);
  


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

 // Attach to button that handles the saving.
  const saveLayout = async (event) => {
    if (event) {
      event.preventDefault();
    }
    
    try {
      const response = await axios.post(url, {
        userLayout: layout,
      });
      console.log('Response:', response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const showModal = () => {
    setModalState(true);
  }


  const addWidget = (type, minWidth, minHeight) => {
    
    let layoutLength = layout.length;
    let largestX = 0;
    let largestY = 0;
    
    for(let k = 0; k < layoutLength; k++){
      if(layout[k].x > largestX){
        largestX = layout[k].x
      }
      if(layout[k].y > largestY){
        largestY = layout[k].y
      }
    }  

    let defaultXOnNewY = 0;
    let LineChartMinWidth = minWidth / (windowWidth/maxNumCols);
    let LineChartMinHeight = (minHeight/rowHeight);
    let newXCoordinate = largestX === 0 ? largestX : largestX + LineChartMinWidth;
    let newYCoordinate = largestY + 1;
    let availableSpace = maxNumCols - LineChartMinWidth;
    let newLayout = null;
    let componentID =  uuidv4();
    

    if(newXCoordinate <= (availableSpace)){
      newLayout = { i: `${componentID}`, x: newXCoordinate, y: largestY, w: LineChartMinWidth, h: LineChartMinHeight };
      newXCoordinate = newXCoordinate + 1;
    } else {
      newLayout = { i: `${componentID}`, x: defaultXOnNewY, y: newYCoordinate, w: LineChartMinWidth, h: LineChartMinHeight };
    }
    
    const newChart = { id: `${componentID}`, type, data: chartTypes[type].data, options: chartTypes[type].options };
    setLayout([...layout, newLayout]);
    setCharts([...charts, newChart]);    
  };


  // const appendChartData = (chartId, newData) => {
  //   setCharts((prevCharts) =>
  //     prevCharts.map((chart) =>
  //       chart.id === chartId
  //         ? {
  //             ...chart,
  //             data: {
  //               ...chart.data,
  //               datasets: chart.data.datasets.map((dataset) => ({
  //                 ...dataset,
  //                 data: [...dataset.data, ...newData],
  //               })),
  //             },
  //           }
  //         : chart
  //     )
  //   );
  // };

  // useEffect(() => {
  //   const fetchData = () => {
  //     // Simulate new data (in a real scenario, fetch from an API)
  //     const newApiData = [Math.floor(Math.random() * 100)];
  //     setApiData(newApiData);

  //     // Append data to the first chart as an example
  //     if (charts.length > 0) {
  //       appendChartData(charts[0].id, newApiData);
  //     }
  //   };

  //   const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds
  //   return () => clearInterval(intervalId); // Cleanup on component unmount
  // }, [charts]);

  
  const handleLayoutChange = (newLayout) => {
    // newLayout.forEach((layout) => {
    //   console.log(`${layout.i} : [w = ${layout.w}, h = ${layout.h}, x = ${layout.x}, y = ${layout.y}]`);
    // })
    
    console.log("Layout: ", newLayout)
    console.log("Last element: ", newLayout[newLayout.length - 1])
    
    setLayout(newLayout)
  }

  const handleDrop = (layout, item, e) => {
    // alert(`Element parameters: ${JSON.stringify(item)}`);
    console.log(`Element parameters: ${JSON.stringify(item)}`)
  };

  return (
    
    <>
      <Header/>
      <Sidebar showModal = {showModal} saveLayout = {saveLayout} addWidget={addWidget} isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <DeviceToolbar isCollapsed={isCollapsed} mqttTopics={apiData.topics}/>
      <div className={`${styles.dashboard} ${isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
        <GridLayout
          className="complex-interface-layout"
          layout={layout}
          cols={maxNumCols}
          rowHeight={rowHeight}
          width={windowWidth}
          onLayoutChange={handleLayoutChange}
          onDrop={handleDrop}
          compactType={compactType}
          margin={margin}
        >
          {
            charts.map((chart) => {
              const ChartComponent =  chartComponents[chart.type];
              return (
                <div key={chart.id}  className={gridcss.gridItem}>
                  <ChartComponent data={chart.data} options={chart.options} />
                </div>
              );
            })          
          }
        </GridLayout>
        <Modal show={modalState} mqttTopics={apiData.topics} onClose={() => setModalState(false)} />
      </div>
    </>
  );
};

export default Dashboard;