import React, { useState, useEffect, useContext } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import DeviceToolbar from './DeviceToolbar.js';
import styles from '../styles/dashboard.module.css';
import gridcss from '../styles/grid.module.css'; 
import  chartTypes  from '../ChartTypes.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns';
import { v4 as uuidv4 } from 'uuid';
import  Modal  from '../Modal/Modal.js'
import { ApiContext } from '../../context/ApiContext';
import { api } from '../../api/api';

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
const TOOLBAR_DESCRIPTION = [{ 
  "name": "Device", 
  "serial": "firstDevice001",
  "active": false,
  "layouts": null,
  "charts": null
}];

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
  // const [apiData, setApiData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [realTimeData, setRealTimeData] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [modalState, setModalState] = useState(false);
  const { apiData } = useContext(ApiContext);
  const [ topics, setTopics ] = useState([]);
  const [ devices, setDevices ] = useState(TOOLBAR_DESCRIPTION);
  

  useEffect(() => {
    if (devices.length === 1) {
      api
        .get('/names-and-serials')
        .then((response) => {

          const fetchedDevices = response.data.map((device, idx) => ({
            name: device.name,
            serial: device.serial,
            active: idx === 0 ? true : false, // THIS IS HARD CODED. SHOULD BE ADDED TO THE DATABASE INSTEAD
            layouts: null,
            charts: null
          }));
   
          // Append the fetched devices to the default TOOLBAR_DESCRIPTION
          setDevices([TOOLBAR_DESCRIPTION[0], ...fetchedDevices]);
  
          // console.log("#Devices: ", [TOOLBAR_DESCRIPTION[0], ...fetchedDevices]);
          // console.log("#Devices: ", devices);
          // setFirstTime(1)
        })
        .catch((error) => {
          console.error('Error fetching data:', error.message);
        });
    }
  }, [devices.length, devices]);


  useEffect(() => {
    if (apiData.topics && apiData.topics.length > 0) {
      const topicsArray = apiData.topics.map(entry => ({
        id: entry.uuid,
        description: entry.description,
        topic: entry.topic
      }));

      setTopics(topicsArray);
    }
  }, [apiData.topics]); 


  // useEffect to log `topics` whenever it changes
  useEffect(() => {
    console.log("Welcome: ", topics);
  }, [topics]);


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

 // Attach to button that handles the saving.
  const saveLayout = async (event) => {
    if (event) {
      event.preventDefault();
    }
    
    // try {
    //   const response = await axios.post(url, {
    //     userLayout: layout,
    //   });
    //   console.log('Response:', response.data);
    // } catch (err) {
    //   console.error('Error:', err);
    // }
  };

  const showModal = () => {
    setModalState(true);
  }

  function findActiveDeviceIndex(devices) {
    return devices.findIndex(device => device.active === true);
  }

  const addWidget = (type, minWidth, minHeight, existingDevices) => {
    const activeDeviceIndex = findActiveDeviceIndex(existingDevices);
  
    // Find largest X and Y coordinates
    const activeDeviceLayouts = existingDevices[activeDeviceIndex]?.layouts || [];
    const layoutLength = activeDeviceLayouts.length;
    let largestX = 0;
    let largestY = 0;
  
    for (let k = 0; k < layoutLength; k++) {
      if (activeDeviceLayouts[k].x > largestX) {
        largestX = activeDeviceLayouts[k].x;
      }
      if (activeDeviceLayouts[k].y > largestY) {
        largestY = activeDeviceLayouts[k].y;
      }
    }
  
    const LineChartMinWidth = minWidth / (windowWidth / maxNumCols);
    const LineChartMinHeight = minHeight / rowHeight;
    const newXCoordinate = largestX === 0 ? largestX : largestX + LineChartMinWidth;
    const newYCoordinate = largestY + 1;
    const availableSpace = maxNumCols - LineChartMinWidth;
    const componentID = uuidv4();
  
    let newLayout;
    if (newXCoordinate <= availableSpace) {
      newLayout = { 
        i: `${componentID}`, 
        x: newXCoordinate, 
        y: largestY, 
        w: LineChartMinWidth, 
        h: LineChartMinHeight 
      };
    } else {
      newLayout = { 
        i: `${componentID}`, 
        x: 0, 
        y: newYCoordinate, 
        w: LineChartMinWidth, 
        h: LineChartMinHeight 
      };
    }
  
    const newChart = {
      id: `${componentID}`,
      type,
      data: chartTypes[type].data,
      options: chartTypes[type].options,
    };
  
    // Update layouts and charts for the active device
    setDevices(prevDevices =>
      prevDevices.map((device, index) =>
        index === activeDeviceIndex
          ? {
              ...device,
              layouts: [...(device.layouts || []), newLayout],
              charts: [...(device.charts || []), newChart],
            }
          : device
      )
    );
  
    console.log("Device summary:", {
      activeDevice: activeDeviceIndex,
      updatedLayouts: activeDeviceLayouts,
      updatedCharts: newChart,
    });
  
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
      <DeviceToolbar isCollapsed={isCollapsed} mqttTopics={topics}/>
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
        <Modal show={modalState} mqttTopics={topics} onClose={() => setModalState(false)} />
      </div>
    </>
  );
};

export default Dashboard;