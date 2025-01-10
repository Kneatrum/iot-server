import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import styles from '../styles/chart-customizing-modal.module.css';
import { ReactComponent as Check } from '../../assets/check.svg';
import { useDispatch, useSelector } from "react-redux";
import { updateLineBorderColor } from "../devicesSlice";

import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

const chartConfigMenuTabItems = ['Select Data Sources', 'Configure Chart']
const dataSourcesIndex = 0;
const chartConfigIndex = 1;

const LineCustomizer = ({ dataSources, setDevices, activeChartId, activeDevice, onClose }) => {

  const dispatch = useDispatch();
  const devices = useSelector((state) => state.devices.devices);


  // Initial chart data
  const [activeTab, setActiveTab] = useState(dataSourcesIndex);
  const [timeUnit, setTimeUnit] = useState("minute"); // Default to minutes
  const [isChecked, setIsChecked] = useState(false);
  const [ showLegend, setShowLegend ] = useState(true);
 

  // setSelectedChartData(selectedChartData)

  // const [chartData, setChartData] = useState({
  //   labels: ["January", "February", "March", "April", "May", "June"],
  //   datasets: [
  //     {
  //       label: "Sample Dataset",
  //       data: [12, 19, 3, 5, 2, 3],
  //       borderColor: "#007bff",
  //       backgroundColor: "rgba(0, 123, 255, 0.3)",
  //       borderWidth: 2,
  //       tension: 0.4,
  //       pointBackgroundColor: "#007bff",
  //     },
  //   ],
  // });

  // Chart options
  // const [chartOptions, setChartOptions] = useState({
  //   responsive: true,
  //   plugins: {
  //     legend: { display: true, position: "top" },
  //     title: { display: true, text: "Customizable Line Chart" },
  //   },
  //   scales: {
  //     x: { grid: { display: true } },
  //     y: { grid: { display: true }, min: 0, max: 20 },
  //   },
  // });


  // Handler functions for form inputs
  const handleLineColorChange = (e) => {

    const newValue = e.target.value;
    const datasetPosition = 0; // Hardcoded
    const path = [activeDevice.index, "charts",  activeDevice.chartIDPosition, datasetPosition ]

    dispatch(updateLineBorderColor({path, newValue}));

  };



  const handleLineTensionChange = (e) => {
    const lineTension = e.target.value;

    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
          // Create a new chart object with updated datasets
          return {
            ...chart,
            data: {
              ...chart.data,
              datasets: chart.data.datasets.map(dataset => ({
                ...dataset,
                tension: lineTension
              }))
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };


  const handleLinePointRadiusChange = (e) => {
    const linePointRadius = e.target.value;

    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
          // Create a new chart object with updated datasets
          return {
            ...chart,
            data: {
              ...chart.data,
              datasets: chart.data.datasets.map(dataset => ({
                ...dataset,
                pointRadius: linePointRadius
              }))
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };


  const handleBorderWidthChange = (e) => {

    const width = e.target.value;

    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
          // Create a new chart object with updated datasets
          return {
            ...chart,
            data: {
              ...chart.data,
              datasets: chart.data.datasets.map(dataset => ({
                ...dataset,
                borderWidth: width
              }))
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };


  const handleTitleChange = (e) => {
    const title = e.target.value;
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
          // Create a new chart object with updated datasets
          return {
            ...chart,
            data: {
              ...chart.data,
              datasets: chart.data.datasets.map(dataset => ({
                ...dataset,
                label: title
              }))
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };



  const handleToggleLegend = () => {

    setShowLegend(!showLegend);
    
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      console.log("Prev Devices: ", prevDevices)
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
  
          // Create a new chart object with updated datasets
          return {
            ...chart,
            options: {
              ...chart.options,
              plugins: {
                ...chart.options.plugins,
                legend: {
                  ...chart.options.plugins.legend,
                  display: !chart.options.plugins.legend.display
                }
              }
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };



  const handleToggleYGrid = () => {
 
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
  
          // Create a new chart object with updated datasets
          return {
            ...chart,
            options: {
              ...chart.options,
              scales: {
                ...chart.options.scales,
                y: {
                  ...chart.options.scales.y,
                  grid: {
                    ...chart.options.scales.y.grid,
                    display: !chart.options.scales.y.grid.display
                  }
                }
              }
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };



  const handleToggleXGrid = () => {
 
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
  
          // Create a new chart object with updated datasets
          return {
            ...chart,
            options: {
              ...chart.options,
              scales: {
                ...chart.options.scales,
                x: {
                  ...chart.options.scales.x,
                  grid: {
                    ...chart.options.scales.x.grid,
                    display: !chart.options.scales.x.grid.display
                  }
                }
              }
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };


  const handleDisplayYTitleText = () => {
 
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
  
          // Create a new chart object with updated datasets
          return {
            ...chart,
            options: {
              ...chart.options,
              scales: {
                ...chart.options.scales,
                y: {
                  ...chart.options.scales.y,
                  title: {
                    ...chart.options.scales.y.title,
                    display: !chart.options.scales.y.title.display
                  }
                }
              }
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };



  const handleDisplayXTitleText = () => {
 
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
  
          // Create a new chart object with updated datasets
          return {
            ...chart,
            options: {
              ...chart.options,
              scales: {
                ...chart.options.scales,
                x: {
                  ...chart.options.scales.x,
                  title: {
                    ...chart.options.scales.x.title,
                    display: !chart.options.scales.x.title.display
                  }
                }
              }
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };

  const handleXTitleChange = (e) => {
    const title = e.target.value;
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
  
          // Create a new chart object with updated datasets
          return {
            ...chart,
            options: {
              ...chart.options,
              scales: {
                ...chart.options.scales,
                x: {
                  ...chart.options.scales.x,
                  title: {
                    ...chart.options.scales.x.title,
                    text: title
                  }
                }
              }
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };


  const handleYTitleChange = (e) => {
    const title = e.target.value;
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
  
          // Create a new chart object with updated datasets
          return {
            ...chart,
            options: {
              ...chart.options,
              scales: {
                ...chart.options.scales,
                y: {
                  ...chart.options.scales.y,
                  title: {
                    ...chart.options.scales.y.title,
                    text: title
                  }
                }
              }
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };


  const handleYStepSizeChange = (e) => {
    const step = e.target.value;
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
  
          // Create a new chart object with updated datasets
          return {
            ...chart,
            options: {
              ...chart.options,
              scales: {
                ...chart.options.scales,
                y: {
                  ...chart.options.scales.y,
                  ticks: {
                    ...chart.options.scales.y.ticks,
                    stepSize: step
                  }
                }
              }
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
  };


  
  const handleXTimeFormatChange = (e) => {
    const timeFormat = e.target.value;
    setTimeUnit(timeFormat);
    setDevices((prevDevices) => {
      // Find the active device
      const activeDevice = prevDevices.find(device => device.active);
      
      if (!activeDevice || !activeDevice.charts) return prevDevices;

      // Create a deep copy of the charts
      const updatedCharts = activeDevice.charts.map(chart => {
        // If this is the chart we want to modify
        if (chart.id === activeChartId) {
  
          // Create a new chart object with updated datasets
          return {
            ...chart,
            options: {
              ...chart.options,
              scales: {
                ...chart.options.scales,
                x: {
                  ...chart.options.scales.x,
                  time: {
                    ...chart.options.scales.x.time,
                    unit: timeFormat
                  }
                }
              }
            }
          };
        }
        return chart;
      });

      // Return updated devices array
      return prevDevices.map(device => 
        device.active ? { ...device, charts: updatedCharts }: device
      );
    });
    
  };

  function handleCheckboxChange(){
    //TO-DO
  }


  // const handleDataPointChange = (e, index) => {
  //   const value = parseInt(e.target.value) || 0;
  //   const newData = [...chartData.datasets[0].data];
  //   newData[index] = value;
  //   setChartData((prevData) => ({
  //     ...prevData,
  //     datasets: [
  //       {
  //         ...prevData.datasets[0],
  //         data: newData,
  //       },
  //     ],
  //   }));
  // };

  return (
    <>
    <div className={styles.modalOverlay}>
      <div className={styles.toolBarContainer}>
        {chartConfigMenuTabItems.map((tab, index) => (
            <div
              key={index}
              className={`${styles.toolBarItem} ${activeTab === index ? styles.toolbarItemActive : ''} ${index === chartConfigIndex && activeTab === chartConfigIndex ? styles.secondToolbarItemActive : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </div>
        ))}

        <div style={{ display: 'flex', height: '38px', border: '1px solid rgb(50, 150, 300, 0.6)', flexShrink: 0, marginLeft: 'auto', borderRadius: '5px'}}>
          <div style={{ padding: '7px', fontWeight: 'bold', flexShrink: 0}}>
            Query Date 
          </div>
          <div style={{paddingTop: '5px', paddingRight: '5px'} }>
            <input type="datetime-local" style={{ height: '28px', border: '1px solid #fff', borderRadius: '5px', paddingLeft: '15px'}}/>
          </div>
        </div>

      </div>

      <div className={styles.toolBarBody}>
        { activeTab === dataSourcesIndex && dataSources.map((dataSource, index) => (
          <div style={{
              display: 'flex',
              padding: '10px', 
              /*border: '1px solid #ccc',*/ 
              marginBottom: '10px', 
              backgroundColor: 'white',
              width: '80%',
            }} 
            key={index}>

            <div>
              <div>
                {dataSource.description}<br/>
              </div>
              <div style={{color: '#888', fontSize: '0.8em'}}>
                Topic: {dataSource.topic}
              </div>
            </div>

            <div style={{marginLeft: 'auto'}}>
              <input 
                type='checkbox' 
                className={styles.checkboxContainer}
                checked={isChecked}
                onChange={handleCheckboxChange}
                />
            </div>

          </div>
        ))}

        { activeTab === chartConfigIndex && (
          <div>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: "10px", border: '1px solid #fff', paddingLeft: '10px', paddingTop: '5px', borderRadius: '5px', backgroundColor: 'white' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <label style={{marginBottom: "10px", fontSize: '0.8em', color: 'GrayText'}}> Legend </label>
                <div style={{ display: 'flex', alignItems: 'center'}}>
                  <input type="checkbox" onChange={handleToggleLegend} style={{width: "20px", height: "20px"}}/>
                  <label style={{ paddingLeft: "10px", paddingRight: "20px"}}> Hide </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column'}}> 
                <div style={{ display: "flex", alignItems: "center", marginBottom: "2px"}}>
                  <label style={{ width: '120px'}}> Coffee </label>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "2px"}}>
                  <label style={{ width: '120px'}}> Tea </label>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: "10px", border: '1px solid #fff', paddingLeft: '10px', paddingTop: '5px', paddingBottom: '10px', borderRadius: '5px', backgroundColor: 'white' }}>
                <label style={{marginBottom: "10px", fontSize: '0.8em', color: 'GrayText'}}> X Axis </label>
                <div style={{ display: "flex", alignItems: "center"}}>
                  <label style={{paddingRight: '10px', width: '120px'}}>Title: </label>
                  <input type="text" onChange={handleXTitleChange} placeholder="Enter X axis title" />  
                  <input type="checkbox" onChange={handleDisplayXTitleText} style={{width: "20px", height: "20px", marginLeft: '50px'}}/>
                  <label style={{paddingLeft: '10px'}}> Hide </label>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: "10px", border: '1px solid #fff', paddingLeft: '10px', paddingTop: '5px', paddingBottom: '10px', borderRadius: '5px', backgroundColor: 'white' }}>
            
              <label style={{marginBottom: "10px", fontSize: '0.8em', color: 'GrayText'}}> Y Axis </label>
                <div style={{ display: "flex", alignItems: "center"}}>
                  <label style={{paddingRight: '10px', width: '120px'}}>Title: </label>
                  <input type="text" onChange={handleYTitleChange} placeholder="Enter Y axis title" />  
                  <input type="checkbox" onChange={handleDisplayYTitleText} style={{width: "20px", height: "20px", marginLeft: '50px'}}/>
                  <label style={{paddingLeft: '10px'}}> Hide </label>
                </div>

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: "10px", border: '1px solid #fff', padding: '10px', borderRadius: '5px', backgroundColor: 'white' }}>
              <div>
                <label style={{paddingRight: '10px', marginTop: '20px', width: '120px'}}>Line Color </label> 
                <input type="color" onChange={handleLineColorChange} />
              </div>
              <div>
                <label style={{paddingRight: '10px', marginTop: '20px', width: '120px'}}>Line Tension </label>
                <input type="range" min="0" step="0.02" max="0.4" onChange={handleLineTensionChange} />
              </div>
              <div>
                <label style={{paddingRight: '10px', marginTop: '20px', width: '120px'}}>Point Radius </label>
                <input type="range" min="0" step="0.1" max="3" onChange={handleLinePointRadiusChange} />
              </div>
              <div>
                <label style={{paddingRight: '10px', marginTop: '20px', width: '120px'}}>Border Width </label>
                <input type="range" min="1" step="0.1" max="5" onChange={handleBorderWidthChange} />
              </div>       
            </div>

          </div>
        )}
      </div>
      
      <div className={styles.buttonContainer}>
        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
    </>
  );
};

export default LineCustomizer;
