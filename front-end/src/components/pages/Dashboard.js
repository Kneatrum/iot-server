import React, { useState, useEffect, useContext, useRef, act } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import DeviceToolbar from './DeviceToolbar.js';
import styles from '../styles/dashboard.module.css';
import gridcss from '../styles/grid.module.css'; 
import  { createNewChart, deserializeChartData }  from '../chartUtils.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns';
import { v4 as uuidv4 } from 'uuid';
import  Modal  from '../Modal/Modal.js'
import { ApiContext } from '../../context/ApiContext';
import { ReactComponent as MoreSVGIcon } from '../../assets/more.svg';
import { api, devicesApi } from '../../api/api';
import ChartCustomizingModal from '../ChartCustomizingModal.js';
import { useDispatch, useSelector } from "react-redux";
import { addDevice, appendLayout, updateLayout, appendChartData, batchAppendChartData } from "../devicesSlice";
import { io } from "socket.io-client";


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
  Legend,
  layouts
} from 'chart.js'
import { set } from 'date-fns';

const socket = io('http://localhost:3000')

const chartComponents = {
  Line: Line,
  Bar: Bar,
  Pie: Pie,
  Doughnut: Doughnut,
};

// import  HeartChart  from '../charts/HeartChart.js';
const environment = process.env.NODE_ENV;
let dataResource = null;

if (environment !== 'development'){
  dataResource = 'ec2Data'
} else {
  dataResource = 'thinkpadData'
}

const ACTIVE_DEVICE = {
  index: 0,
  deviceName: "",
  serialNumber: "",
  chartID: null,
  chartIDPosition: -1
}

const backEndHost = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const url = `${backEndHost}/user/layout`

const maxNumCols = 12;
const windowWidth = 1800;
const rowHeight = 30;
const layoutSaveCounterPeriod = 3; // 10 seconds

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
  const [userID, setUserID] = useState(null);
  const [chartData, setChartData] = useState({});
  const [realTimeData, setRealTimeData] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [modalState, setModalState] = useState(false);
  const { apiData } = useContext(ApiContext);
  const [ topics, setTopics ] = useState([]);
  const [ deviceCount, setDeviceCount ] = useState(0);
  const [ customizeChartModal, setCustomizeChartModal ] = useState(false);
  const [ activeChartId, setActiveChartId ] = useState(null); 
  const [ activeDevice, setActiveDevice ] = useState(ACTIVE_DEVICE);
  const [ indexOfSelectedChartId, setIndexOfSelectedChartId ] = useState(null);
  const [overlayActive, setOverlayActive] = useState(false);
  const [ newModalPosition, setNewModalPosition ] = useState({x: 100, y: 100});
  const [layoutSaveCounter, setlayoutSaveCounter] = useState(layoutSaveCounterPeriod); // Countdown from 10 seconds
  const [layoutChanged, setLayoutChanged] = useState(false); // Tracks if the layout was changed
  const [syncronizeChanges, setSynchronizeChanges ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(true);
  const sync = useRef(false);

  const dispatch = useDispatch();
  const devices = useSelector((state) => state.devices.devices);
  // console.log("!!!!!!!!!!Layout: ", devices)

  // useEffect(() => {
  //   console.log("(UseEffect) New device count: ", deviceCount);
  // }, [deviceCount]);

  // useEffect(() => {
  //   console.log("(UseEffect) Active device: ", activeDevice);
  //   console.log("Devices: ", devices)
  // }, [activeDevice])

  useEffect(() => {
  const handlePayload = (payload) => {
    // console.log("Payload received:", payload);

    const updates = [];

    for (const device of payload) {
      const { deviceId, charts } = device;

      for (const chart of charts) {
        const { chartId, dataPoint, timestamp } = chart;

        updates.push({
          deviceIndex: deviceId,   
          layoutIndex: 0,          // Not used in this context, set to 0
          chartIndex: chartId,
          newLabel: timestamp,
          newDataPoint: dataPoint,
          maxDataPoints: 100
        });
      }
    }

    // Dispatch all updates in one go
    dispatch(batchAppendChartData(updates));
  };

  socket.on(dataResource, handlePayload);
  console.log("Socket listener for cpuData set up");

  return () => {
    socket.off(dataResource, handlePayload);
  };
}, [dispatch]);

//     useEffect(() => {
//     socket.on("thinkpadData", (data) => {
//         console.log("CPU Data received:", data);
        
//         // Based on your data structure, you need to:
//         // 1. Find the correct layout index (not use chartIndex as layoutIndex)
//         // 2. Use chartIndex = 0 since each layout has chart array with index 0
        
//         dispatch(appendChartData({
//             deviceIndex: 0,        // Device at index 1
//             layoutIndex: 0,        // Layout at index 1 (this should match the layout you want to update)
//             chartIndex: 0,         // Chart at index 0 within the chart array
//             newLabel: Date.now(),
//             newDataPoint: 12,
//             maxDataPoints: 20
//         }));
//     });

//     return () => {
//         socket.off("thinkpadData");
//     };
// }, [dispatch]); // Add dispatch as dependency


  
  useEffect(() => {
    api.get('/identity')
    .then((response) => {
      console.log("Response: ", response.data);
      if(response.data){
        setUserID(response.data);
      }
    })
    .catch((error) => {
      console.log("Error: ", error.message)
    })
  }, [ isLoading ]);


  useEffect(() => {
    devicesApi
      .get('/device-details')
      .then((response) => {
        console.log('Data fetched:', response.data);
        
        // Get current devices from Redux store
        const currentDevices = devices;
  
        // Filter out devices that already exist in the store
        const newDevices = response.data.filter(fetchedDevice => 
          !currentDevices.some(existingDevice => 
            existingDevice.serial === fetchedDevice.serial
          )
        );
  
        // Only add devices if there are new ones
        console.log("New Devices: ", newDevices);
        if (newDevices.length > 0) {
          dispatch(addDevice(newDevices));
        }

        setIsLoading(false);
  
        // Update device count based on total devices (existing + new)
        setDeviceCount(currentDevices.length + newDevices.length);
        console.log("Device count: ", currentDevices.length + newDevices.length);
  
        // Set active device if none is currently active
        // if (currentDevices.length + newDevices.length > 0) {
        //   let activeDeviceIndex = currentDevices.findIndex(device => device.activeStatus === true);
          
        //   // If no active device found in current devices, check new devices
        //   if (activeDeviceIndex === -1 && newDevices.length > 0) {
        //     activeDeviceIndex = currentDevices.length; // Index will be after existing devices
        //   }
          
        //   if (activeDeviceIndex !== -1) {
        //     const targetDevice = activeDeviceIndex >= currentDevices.length 
        //       ? newDevices[activeDeviceIndex - currentDevices.length] 
        //       : currentDevices[activeDeviceIndex];
  
        //     setActiveDevice({
        //       index: activeDeviceIndex,
        //       deviceName: targetDevice.name,
        //       serialNumber: targetDevice.serial,
        //     });
        //   }
        // }
      })
      .catch((error) => {
        console.error('Error fetching data:', error.message);
      });
  }, []); 


  useEffect(() => {
    if(!isLoading){
      const index = devices.findIndex(device => device.activeStatus);
      const result = index !== -1 ? { index, device: devices[index] } : null;

      if(result){
       
        const activeDevice = {
          index: result.index,
          deviceName: result.device.deviceName,
          serialNumber: result.device.serialNumber,
          chartID: null,
          chartIDPosition: -1
        }
  
        setActiveDevice(activeDevice);
        
      }
    }
  }, [ isLoading ])


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
  // useEffect(() => {
  //   console.log("Welcome: ", topics);
  // }, [topics]);


useEffect(() => {
  let timer;
  if (layoutChanged) {
    setlayoutSaveCounter(layoutSaveCounterPeriod); // Reset the counter when a layout change is detected
    timer = setInterval(() => {
      setlayoutSaveCounter((prevCounter) => {
        if (prevCounter === 1) {
          clearInterval(timer); // Stop the timer once the counter reaches 0
          saveLayout(); // Save the layout
          setLayoutChanged(false); // Reset layoutChanged after saving
          return 0;
        }
        // console.log("Countdown: ", prevCounter); 
        return prevCounter - 1;
      });
    }, 1000);
  }
  return () => {
    clearInterval(timer); // Clear the timer on component unmount or before restarting
  };
}, [layoutChanged]);


useEffect(() => {
  if(sync.current === true && !isLoading && (devices[activeDevice.index].changes.length > 0 )){
    sync.current = false;
    console.log("@@@@@@@@Changes: ", devices[activeDevice.index].changes);
    devicesApi
      .post('/batch-updates', {changes:  devices[activeDevice.index].changes})
      .then((response) => {
        // console.log('$$$$$$$$$$$$$$$Data fetched:', response.data);
        // devices[activeDevice.index].changes = [];
      })
      .catch((error) => {
        console.error('Error updating layout:', error);
      });
  }
}, [syncronizeChanges]); 


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

 // Attach to button that handles the saving.
  // const saveLayout = async (event) => {
  //   if (event) {
  //     event.preventDefault();
  //   }
  const saveLayout = async () => {
    
    // try {
    //   const response = await axios.post(url, {
    //     userLayout: "Your layout data here", // Replace with actual layout data
    //   });
    //   console.log("Layout saved successfully:", response.data);
    // } catch (error) {
    //   console.error("Error saving layout:", error.message);
    // }
    // setSynchronizeChanges(true);
    // console.log("Layout saved successfully", devices[activeDevice.index].changes);
  };


const handleOpenModal = (chartId, ddevices) => {
    setActiveChartId(chartId); // Set the active chart ID
    
    // Find the chart in the active device's layouts
    let tempActiveChardIdIndex = -1;
    const activeDeviceData = ddevices[activeDevice.index];
    
    if (activeDeviceData && activeDeviceData.layouts) {
      // Find the layout item that contains the chart with this ID
      const layoutWithChart = activeDeviceData.layouts.find(layoutItem => 
        layoutItem.chart && layoutItem.chart.some(chart => chart.config.id === chartId)
      );
      
      if (layoutWithChart) {
        tempActiveChardIdIndex = activeDeviceData.layouts.indexOf(layoutWithChart);
      }
    }
    
    setActiveDevice((prevDevice) => ({
      ...prevDevice,
      chartID: chartId,
      chartIDPosition: tempActiveChardIdIndex,
    }));

    setOverlayActive(true);
    setCustomizeChartModal(true); // Open the modal
    const lay = findLayoutByChartId(chartId, ddevices);
    const position = calculateModalPosition(lay, windowWidth, maxNumCols, rowHeight);
    setNewModalPosition(position);
  };


  function findLayoutByChartId(chartId, devices) {
    for (const device of devices) {
      if (device.layouts) {
        // Find the layout item that contains the chart with this ID
        const layoutWithChart = device.layouts.find(layoutItem => 
          layoutItem.chart && layoutItem.chart.some(chart => chart.config.id === chartId)
        );
        
        if (layoutWithChart) {
          return layoutWithChart.layout;
        }
      }
    }
    return null;
  }


  function findSelectedChartById(chartId, devices){
    for (const device of devices) {
      if (device.activeStatus && device.layouts) {
        // Find the layout item that contains the chart with this ID
        const layoutWithChart = device.layouts.find(layoutItem => 
          layoutItem.chart && layoutItem.chart.some(chart => chart.config.id === chartId)
        );
        
        if (layoutWithChart) {
          return layoutWithChart.chart.find(chart => chart.config.id === chartId);
        }
      }
    }
    return null;
  }


  const calculateModalPosition = (layout, windowWidth, maxNumCols, rowHeight, modalWidth = 200) => {
    // Calculate the width of a single grid column in pixels
    const columnWidth = windowWidth / maxNumCols;
    
    // Chart's position and width in pixels
    const chartLeft = layout.x * columnWidth;
    const chartRight = chartLeft + (layout.w * columnWidth);
    
    // Determine modal position based on available space
    let x;
    if (chartRight + modalWidth + 10 <= windowWidth) {
      // Enough space on the right side
      x = chartRight + 40;
    } else if (chartLeft - modalWidth - 10 >= 0) {
      // Enough space on the left side
      x = chartLeft - modalWidth - 10;
    } else {
      // Not enough space on either side, default to right side
      x = chartRight + 10;
    }
    
    // Align modal's top with the top of the chart
    const y = (layout.y * rowHeight) + 134;
    
    return { x, y };
};
  



  const showModal = () => {
    setModalState(true);
  }

  function findActiveDeviceIndex(devices) {
    return devices.findIndex(device => device.activeStatus === true);
  }
  
  function getLargestXAndYCoOrdinates(activeDevicelayout){
    const layoutLength = activeDevicelayout.length;
    let largestX = 0;
    let largestY = 0;
  
    for (let k = 0; k < layoutLength; k++) {
      if (activeDevicelayout[k].x > largestX) {
        largestX = activeDevicelayout[k].x;
      }
      if (activeDevicelayout[k].y > largestY) {
        largestY = activeDevicelayout[k].y;
      }
    }
    return {largestXCoordinate: largestX, largestYCoordinate: largestY}
  }

  function generateNewLayout(xAndYCoOrdinates, minHeight, minWidth, componentID){
    let largestX = xAndYCoOrdinates.largestXCoordinate;
    let largestY = xAndYCoOrdinates.largestYCoordinate;

    const LineChartMinWidth = minWidth / (windowWidth / maxNumCols);
    const LineChartMinHeight = minHeight / rowHeight;
    const newXCoordinate = largestX === 0 ? largestX : largestX + LineChartMinWidth;
    const newYCoordinate = largestY + 1;
    const availableSpace = maxNumCols - LineChartMinWidth;
  
    
    if (newXCoordinate <= availableSpace) {
      return { 
        i: `${componentID}`, 
        x: newXCoordinate, 
        y: largestY, 
        w: LineChartMinWidth, 
        h: LineChartMinHeight 
      };
    } else {
      return { 
        i: `${componentID}`, 
        x: 0, 
        y: newYCoordinate, 
        w: LineChartMinWidth, 
        h: LineChartMinHeight 
      };
    }

  }

  const addWidget = (type, minWidth, minHeight, existingDevices) => {
    const componentID = uuidv4();
    const activeDeviceIndex = findActiveDeviceIndex(existingDevices);

    if (activeDeviceIndex === -1) {
      console.error("No active device found!");
      return;
    }
  
    // Find largest X and Y coordinates
    const activeDeviceLayouts = existingDevices[activeDeviceIndex]?.layouts || [];
    const xAndYCoOrdinates = getLargestXAndYCoOrdinates(activeDeviceLayouts);
    const newLayout = generateNewLayout(xAndYCoOrdinates, minHeight, minWidth,  componentID);
  
    const newChart = createNewChart(type, componentID);

    const now = new Date();
    now.setMinutes(0, 0, 0); // Set the default time to the last top of the hour.
    const formattedDateTime = now.toISOString().slice(0, 16);
    

    if(devices.length > 0){
      // console.log("Devices :", devices);
      // console.log("\nActive Index: ", activeDevice.index, "\nNew Layout: ", newLayout, "\nNew chart :", newChart)
      
      // let layoutData = {
      //   deviceID: activeDevice.index,
      //   newLayout
      // }

      // let chartData = {
      //   chartType: type,
      //   newChart,
      //   dateSpan: formattedDateTime
      // }

      
      console.log("Appending: ", existingDevices[activeDeviceIndex].serialNumber)
      dispatch(appendLayout({
        dbAction: "appendLayout", 
        deviceID: activeDevice.index,
        serialNumber: existingDevices[activeDeviceIndex].serialNumber,
        newLayout,
        newChart,
        formattedDateTime
      }));


      setSynchronizeChanges((prevState) => !prevState);
      sync.current = true;
      

    } else {
      console.log("You have no devices")
    }
  
    // console.log("Device summary:", {
    //   activeDevice: activeDeviceIndex,
    //   updatedLayouts: activeDeviceLayouts,
    //   updatedCharts: newChart,
    // });
  
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

  const notifyChangeInLayout = () => {
    setLayoutChanged(false); // Temporarily set to false
    setTimeout(() => {
      setLayoutChanged(true); // Set back to true after a delay
    }, 0); // Re-enable immediately
  };
  


  const handleLayoutChange = (newLayout) => {

    // Extract current layouts from the active device's layouts structure
    const currentDevice = devices[activeDevice.index];
    if (!currentDevice || !currentDevice.layouts) return;

    const previousLayouts = currentDevice.layouts.map(layoutItem => layoutItem.layout);
    const changedLayout = getChangedLayoutWithChanges(previousLayouts, newLayout);
    
    if(!changedLayout) return;
    if(!activeDevice.serialNumber) return; // This line prevents proceeding without the active device parameters being set.
    
    let lengthOfChanges = changedLayout.length;
      
    for(let i = 0; i < lengthOfChanges; i++){
      dispatch(updateLayout({
        dbAction: "updateLayout",
        serialNumber: activeDevice.serialNumber, 
        deviceIndex: activeDevice.index, 
        layoutIndex: changedLayout[i].i, 
        layoutChanges: changedLayout[i].changes
      }));
    }
    
    setlayoutSaveCounter(layoutSaveCounter);
    notifyChangeInLayout();
    setSynchronizeChanges((prevState) => !prevState);
    sync.current = true;
  }




function getChangedLayoutWithChanges(prevLayouts, newLayouts) {
  if (!Array.isArray(prevLayouts) || !Array.isArray(newLayouts)) {
      console.error("Invalid input: Both arguments must be arrays.");
      return null;
  }

  const changes = [];

  // Create a map of previous layouts for efficient lookup
  const prevLayoutsMap = new Map(
      prevLayouts.map(layout => [layout.i, layout])
  );

  // Check each new layout against its previous state
  newLayouts.forEach(newLayout => {
      const prevLayout = prevLayoutsMap.get(newLayout.i);
      if (!prevLayout) return; // Skip if it's a new layout

      // Compare properties
      const changedProperties = {};
      let hasChanges = false;

      ['x', 'y', 'w', 'h'].forEach(prop => {
          if (newLayout[prop] !== prevLayout[prop]) {
              changedProperties[prop] = newLayout[prop];
              hasChanges = true;
          }
      });

      if (hasChanges) {
          changes.push({
              i: newLayout.i,
              changes: changedProperties,
              type: 'modified'
          });
      }
  });

  return changes.length > 0 ? changes : null;
}
  

  const handleDrop = (layout, item, e) => {
    // alert(`Element parameters: ${JSON.stringify(item)}`);
    console.log(`Element parameters: ${JSON.stringify(item)}`)
  };

  const handleCloseModal = () => {
    setCustomizeChartModal(false);
    setOverlayActive(false); 
    setActiveChartId(null);
  };

  // Helper function to get all charts from the active device
  const getActiveDeviceCharts = () => {
    const currentDevice = devices[activeDevice.index];
    if (!currentDevice || !currentDevice.layouts) return [];
    
    const charts = [];
    currentDevice.layouts.forEach(layoutItem => {
      if (layoutItem.chart && layoutItem.chart.length > 0) {
        layoutItem.chart.forEach(chart => {
          charts.push({
            ...chart,
            layoutId: layoutItem.layout.i
          });
        });
      }
    });
    
    return charts;
  };

  // Helper function to get all layouts from the active device
  const getActiveDeviceLayouts = () => {
    const currentDevice = devices[activeDevice.index];
    if (!currentDevice || !currentDevice.layouts) return [];
    const deviceLayout = currentDevice.layouts.map(layoutItem => layoutItem.layout);
    // console.log("^^^^^^^^^^^^^^^^^Device layout: ", deviceLayout)
    
    return deviceLayout
  };

  return (
    
    <>
      <Header/>
      <Sidebar showModal = {showModal} saveLayout = {saveLayout} addWidget={addWidget} devices={devices} isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <DeviceToolbar isCollapsed={isCollapsed} mqttTopics={topics} devices={devices}  activeDevice={activeDevice} setActiveDevice={setActiveDevice}  setDeviceCount={setDeviceCount} userID = {userID}/>
      {overlayActive && <div className={styles.overlay}></div>}

      { (!isLoading) && (activeDevice.index !== null && activeDevice.index !== undefined) && devices[activeDevice.index]  && 
        <div className={`${styles.dashboard} ${isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>

          <GridLayout
            className="complex-interface-layout"
            layout={getActiveDeviceLayouts()}
            isDraggable={false}
            isResizable={false}
            cols={maxNumCols}
            rowHeight={rowHeight}
            width={windowWidth}
            onLayoutChange={handleLayoutChange}
            onDrop={handleDrop}
            compactType={compactType}
            margin={margin}
          >
            
            {getActiveDeviceCharts().map((chartItem) =>  {
              const ChartComponent = chartComponents[chartItem.config.type];
              const fullChartData = deserializeChartData(chartItem.config);
              // console.log("Full chart data: ", fullChartData)
              return (
                <div key={chartItem.config.id} className={`${gridcss.gridItem} ${chartItem.config.id === activeChartId ? gridcss.activeChart : ''}`}>
                  <div 
                    className={gridcss.kebabMenu} 
                    onClick={() => handleOpenModal(chartItem.config.id, devices)}>
                      <MoreSVGIcon/> 
                  </div>
                  <ChartComponent data={fullChartData.data} options={fullChartData.options} />
                </div>
              );
            })}

          </GridLayout>

          <Modal show={modalState} mqttTopics={topics} onClose={() => setModalState(false)} />
          {customizeChartModal && (
            <ChartCustomizingModal 
              setCustomizeChartModal={handleCloseModal} 
              // selectedChartData={selectedChartData} 
              // setSelectedChartData={setSelectedChartData}
              activeDevice={activeDevice}
              dataSources={topics} 
              modalPosition={newModalPosition}
            />
          )}
        </div>
      }
    </>
  );
};

export { Dashboard };