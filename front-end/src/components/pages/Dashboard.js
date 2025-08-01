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
import { addDevice, appendLayout, updateLayout } from "../devicesSlice";


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

const chartComponents = {
  Line: Line,
  Bar: Bar,
  Pie: Pie,
  Doughnut: Doughnut,
};

// import  HeartChart  from '../charts/HeartChart.js';


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
  // console.log("Layout: ", layout)

  // useEffect(() => {
  //   console.log("(UseEffect) New device count: ", deviceCount);
  // }, [deviceCount]);

  // useEffect(() => {
  //   console.log("(UseEffect) Active device: ", activeDevice);
  //   console.log("Devices: ", devices)
  // }, [activeDevice])

  
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
          const formattedDevices = newDevices.map((device) => ({
            deviceName: device.deviceName,
            serialNumber: device.serialNumber,
            activeStatus: device.activeStatus,
            layouts: device.layouts.map(layoutItem => layoutItem.layout) || [],  // Get the layout from the backend
            charts: device.layouts
            .filter(layoutItem => layoutItem.chart && layoutItem.chart[0]?.config) // Ensure chart and config exist
            .map(layoutItem => layoutItem.chart[0].config) || [], // Extract chart config// Get the charts from the backend
            topics: device.topics,
            changes: []   // For tracking changes.
          }));
          console.log("Formated Devices: ", formattedDevices)
          dispatch(addDevice(formattedDevices));
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
        console.log("AAAIIII", activeDevice)
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
        devices[activeDevice.index].changes = [];
      })
      .catch((error) => {
        console.error('Error fetching data:', error.message);
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
    // console.log("Chart ID: ", chartId)
    // console.log("Active chart ID", activeChartId)
    
    let tempActiveChardIdIndex = ddevices[activeDevice.index].charts.findIndex((chart) => chart.id === chartId)
    // let tempActiveChardIdIndex = ddevices[activeDevice.index].layouts.id;
    // console.log("Index of chart id: ", tempActiveChardIdIndex)
    // if(tempActiveChardIdIndex !== -1){
    //   setIndexOfSelectedChartId(tempActiveChardIdIndex);
    // }
    
    setActiveDevice((prevDevice) => ({
      ...prevDevice,
      chartID: chartId,
      chartIDPosition: tempActiveChardIdIndex,
      
    }));

    // console.log("Active device: ", activeDevice)


    // let tempActiveChardIdIndex = ddevices[activeDevice.index].charts.findIndex((chart) => chart.id === activeChartId)
    // if(tempActiveChardIdIndex !== -1){
    //   setIndexOfSelectedChartId(tempActiveChardIdIndex);
    // }

    setOverlayActive(true);
    setCustomizeChartModal(true); // Open the modal
    const lay = findLayoutByChartId(chartId, ddevices);
    // const selectedChart = findSelectedChartById(chartId, devices);
    // setSelectedChartData(selectedChart);
    const position = calculateModalPosition(lay, windowWidth, maxNumCols, rowHeight);
    setNewModalPosition(position);
    // console.log({
    //   ChartID: chartId, 
    //   ChartModal:  customizeChartModal, 
    //   position: position,
    //   layout:  lay
    // })
  };


  function findLayoutByChartId(chartId, devices) {
    for (const device of devices) {
      if (device.layouts && device.charts) {
        // Loop through charts to find the one matching the chartId
        const matchingChart = device.charts.find(chart => chart.id === chartId);
        
        if (matchingChart) {
          // Find the corresponding layout by matching the chart's ID
          const matchingLayout = device.layouts.find(layout => layout.i === chartId);
          if (matchingLayout) {
            return matchingLayout;
          }
        }
      }
    }
    // Return null if no matching layout is found
    return null;
  }


  function findSelectedChartById(chartId, devices){
    const activeChart = devices.find(device => device.activeStatus)
    ?.charts.find(chart => chart.id === chartId);
    return activeChart;
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

    let previousLayouts = devices[activeDevice.index].layouts;

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
            layout={devices[activeDevice.index].layouts || []}
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
            
            {devices[activeDevice.index].charts.map((serializedChart) => {
              const ChartComponent = chartComponents[serializedChart.type];
              const fullChartData = deserializeChartData(serializedChart);
              // console.log("Full chart data: ", fullChartData)
              return (
                <div key={serializedChart.id} className={`${gridcss.gridItem} ${serializedChart.id === activeChartId ? gridcss.activeChart : ''}`}>
                  <div 
                    className={gridcss.kebabMenu} 
                    onClick={() => handleOpenModal(serializedChart.id, devices)}>
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