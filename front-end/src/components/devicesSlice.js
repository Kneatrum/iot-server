




import { createSlice } from '@reduxjs/toolkit';
const { produce } = require("immer");


const initialState = {
    devices: [],
};



const devicesSlice = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        addDevice: (state, action) => {
            if (Array.isArray(action.payload)) {
                // Add changes array to each device if it doesn't exist
                const devicesWithChanges = action.payload.map(device => ({
                    ...device,
                    changes: device.changes || []
                }));
                state.devices.push(...devicesWithChanges);
                console.log("Added multiple devices with changes array");
            } else {
                // Add changes array if it doesn't exist
                const deviceWithChanges = {
                    ...action.payload,
                    changes: action.payload.changes || []
                };
                state.devices.push(deviceWithChanges);
                console.log("Added single device with changes array");
            }
        },
        updateChartData: (state, action) => {
            const { deviceIndex, layoutIndex, chartIndex, newLabels, newDataPoints, datasetIndex = 0 } = action.payload;

            // Validate path structure
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[layoutIndex] &&
                state.devices[deviceIndex].layouts[layoutIndex].chart &&
                state.devices[deviceIndex].layouts[layoutIndex].chart[chartIndex] &&
                state.devices[deviceIndex].layouts[layoutIndex].chart[chartIndex].config.data
            ) {
                const chartData = state.devices[deviceIndex].layouts[layoutIndex].chart[chartIndex].config.data;

                // Update labels (timestamps)
                if (newLabels && Array.isArray(newLabels)) {
                    chartData.labels = newLabels;
                }

                // Update dataset data points
                if (newDataPoints && Array.isArray(newDataPoints) && chartData.datasets[datasetIndex]) {
                    chartData.datasets[datasetIndex].data = newDataPoints;
                }

                console.log(`Updated chart data for device ${deviceIndex}, layout ${layoutIndex}, chart ${chartIndex}`);
                console.log('New labels:', chartData.labels);
                console.log('New data points:', chartData.datasets[datasetIndex]?.data);

            } else {
                console.error("Invalid path structure for updating chart data:", {
                    deviceIndex,
                    layoutIndex,
                    chartIndex,
                    datasetIndex
                });
            }
        },
        // Alternative reducer for appending new data points (useful for real-time data)
        appendChartData: (state, action) => {
            const { deviceIndex, layoutIndex, chartIndex, newLabel, newDataPoint, datasetIndex = 0, maxDataPoints = 100 } = action.payload;
            const chartKey = "chart"; // Assuming chart is always the key for charts

            // Validate path structure
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data
            ) {
                const chartData = state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data;

                // Append new label (timestamp)
                if (newLabel !== undefined) {
                    chartData.labels.push(newLabel);
                }

                // Append new data point
                if (newDataPoint !== undefined && chartData.datasets[datasetIndex]) {
                    chartData.datasets[datasetIndex].data.push(newDataPoint);
                }

                // Limit the number of data points to prevent memory issues
                if (chartData.labels.length > maxDataPoints) {
                    chartData.labels = chartData.labels.slice(-maxDataPoints);
                }
                
                if (chartData.datasets[datasetIndex] && chartData.datasets[datasetIndex].data.length > maxDataPoints) {
                    chartData.datasets[datasetIndex].data = chartData.datasets[datasetIndex].data.slice(-maxDataPoints);
                }

                console.log(`Appended data point for device ${deviceIndex}, layout ${layoutIndex}, chart ${chartIndex}`);
                console.log('Current data length:', chartData.datasets[datasetIndex]?.data.length);

            } else {
                console.error("Invalid path structure for appending chart data:", {
                    deviceIndex,
                    layoutIndex,
                    chartIndex,
                    datasetIndex
                });
            }
        },
        batchAppendChartData: (state, action) => {
            action.payload.forEach(update => {
                const { deviceIndex, layoutIndex, chartIndex, newLabel, newDataPoint, datasetIndex = 0, maxDataPoints = 100 } = update;
                const chartKey = "chart"; // Assuming chart is always the key for charts

                // Same validation as appendChartData
                if (
                    state.devices[deviceIndex] &&
                    state.devices[deviceIndex].layouts &&
                    state.devices[deviceIndex].layouts[chartIndex] &&
                    state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                    state.devices[deviceIndex].layouts[chartIndex][chartKey][0] &&
                    state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data

                    // state.devices[deviceIndex] &&
                    // state.devices[deviceIndex].layouts &&
                    // state.devices[deviceIndex].layouts[chartIndex] &&
                    // state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                    // state.devices[deviceIndex].layouts[chartIndex][chartKey][0]
                ) {
                    const chartData = state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data;

                    if (newLabel !== undefined) {
                        chartData.labels.push(newLabel);
                    }

                    if (newDataPoint !== undefined && chartData.datasets[datasetIndex]) {
                        chartData.datasets[datasetIndex].data.push(newDataPoint);
                    }

                    if (chartData.labels.length > maxDataPoints) {
                        chartData.labels = chartData.labels.slice(-maxDataPoints);
                    }

                    if (chartData.datasets[datasetIndex] && chartData.datasets[datasetIndex].data.length > maxDataPoints) {
                        chartData.datasets[datasetIndex].data = chartData.datasets[datasetIndex].data.slice(-maxDataPoints);
                    }
                } else {
                    console.error("Invalid path structure for batch appending chart data:", {
                        deviceIndex,
                        layoutIndex,
                        chartIndex,
                        datasetIndex
                    });
                }
            });
        },
      
        // Batch update for multiple data points (efficient for bulk updates)
        batchUpdateChartData: (state, action) => {
            const { updates } = action.payload;

            updates.forEach(update => {
                const { deviceIndex, layoutIndex, chartIndex, newLabels, newDataPoints, datasetIndex = 0 } = update;

                if (
                    state.devices[deviceIndex] &&
                    state.devices[deviceIndex].layouts &&
                    state.devices[deviceIndex].layouts[chartIndex] &&
                    state.devices[deviceIndex].layouts[chartIndex]["chart"] &&
                    state.devices[deviceIndex].layouts[chartIndex]["chart"][0] &&
                    state.devices[deviceIndex].layouts[chartIndex]["chart"][0].config.data
                ) {
                    const chartData = state.devices[deviceIndex].layouts[chartIndex]["chart"][0].config.data;

                    if (newLabels && Array.isArray(newLabels)) {
                        chartData.labels = newLabels;
                    }

                    if (newDataPoints && Array.isArray(newDataPoints) && chartData.datasets[datasetIndex]) {
                        chartData.datasets[datasetIndex].data = newDataPoints;
                    }
                }
            });

            console.log(`Batch updated ${updates.length} charts`);
        },
        setActiveDeviceIndex: (state, action) => {
            const { prevIndex, activeIndex } = action.payload;
            // console.log("Previous: ", state.devices[prevIndex].activeStatus)
            // console.log("Current: ", state.devices[activeIndex].activeStatus)
            state.devices[prevIndex].activeStatus = false; // Set the previous active device to false
            state.devices[activeIndex].activeStatus = true; // Set the active device to true
        },
        updateDevice: (state, action) => {
            const { serialNumber, changes } = action.payload;
            const device = state.devices.find((device) => device.serialNumber === serialNumber);
            if (device) {
                device.changes = changes;
            }
        },
        removeDevice: (state, action) => {
            state.devices = state.devices.filter((device) => device.serialNumber !== action.payload);
        },
        updateLayout: (state, action) => {
            const { dbAction, serialNumber, deviceIndex, layoutIndex, layoutChanges } = action.payload;
                        
            if (state.devices[deviceIndex] && Array.isArray(state.devices[deviceIndex].layouts)) {
                // Find the layout item that contains the layout with the given ID
                const layoutItem = state.devices[deviceIndex].layouts.find(
                    item => item.layout && item.layout.i === layoutIndex
                );

                if (layoutItem && layoutItem.layout) {
                    // Merge the existing layout with the updated layout
                    layoutItem.layout = {
                        ...layoutItem.layout,
                        ...layoutChanges,
                    };

                    // Ensure changes array exists
                    if (!state.devices[deviceIndex].changes) {
                        state.devices[deviceIndex].changes = [];
                    }

                    state.devices[deviceIndex].changes.push({
                        dbAction,
                        serialNumber,
                        layoutIndex,
                        layoutChanges
                    });

                    console.log("Update layout changes: ", state.devices[deviceIndex].changes)

                } else {
                    console.error("Invalid layout index - layout not found");
                }
            } else {
                console.error("Invalid device index or layouts is not an array");
            }
        },
        appendLayout: (state, action) => {
            const { dbAction, deviceID, serialNumber, newLayout, newChart, formattedDateTime } = action.payload;
            if (state.devices[deviceID] && Array.isArray(state.devices[deviceID].layouts)) {
                // Create new layout item with the original structure
                const newLayoutItem = {
                    layout: newLayout,
                    chart: [{
                        config: newChart,
                        chartType: newChart.type,
                        dateSpan: formattedDateTime
                    }]
                };

                state.devices[deviceID].layouts.push(newLayoutItem);

                // Ensure changes array exists
                if (!state.devices[deviceID].changes) {
                    state.devices[deviceID].changes = [];
                }

                state.devices[deviceID].changes.push({
                    dbAction,
                    serialNumber: serialNumber,
                    dbPayload: { 
                       newLayout, 
                        chart: { 
                            newChart, 
                            dateSpan: formattedDateTime
                        } 
                    }
                });

            } else {
                console.error("Invalid device index or layouts is not an array");
            }
        },
        
        updateLayoutProperties: (state, action) => {
            const { path, newValue } = action.payload;

            // Use Immer to update the layout immutably
            produce(state, (draft) => {
                let target = draft.layout;
                for (let i = 0; i < path.length - 1; i++) {
                    target = target[path[i]];
                }
                const key = path[path.length - 1];
                draft.changes.push({ path, oldValue: target[key], newValue });
                target[key] = newValue;
            })(state);
        },
        updateLineBorderColor: (state, action) => {
            const { path, newValue } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex, datasetIndex]
            const [deviceIndex, chartKey, chartIndex, datasetIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex]
            ) {
                const targetDataset = state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex];

                // Ensure the "changes" array exists
                if (!state.devices[deviceIndex].changes) {
                    state.devices[deviceIndex].changes = [];
                }

                // Check if a change for this path already exists
                const existingChangeIndex = state.devices[deviceIndex].changes.findIndex(
                    (change) => JSON.stringify(change.path) === JSON.stringify(path)
                );

                if (existingChangeIndex !== -1) {
                    // Overwrite the existing change
                    state.devices[deviceIndex].changes[existingChangeIndex] = {
                        path,
                        oldValue: targetDataset.borderColor,
                        newValue,
                    };
                } else {
                    // Push a new change
                    state.devices[deviceIndex].changes.push({
                        path,
                        oldValue: targetDataset.borderColor,
                        newValue,
                    });
                }

                // Update the borderColor
                targetDataset.borderColor = newValue;
            }
        },
        updateLineTension: (state, action) => {
            const { path, lineTension } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex, datasetIndex]
            const [deviceIndex, chartKey, chartIndex, datasetIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex]
            ) {
                const targetDataset = state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex];

                // Update the line tension
                console.log("Updating line tension with: ", lineTension)
                targetDataset.tension = lineTension;
            }
        },
        updateLinePointRadius: (state, action) => {
            const { path, linePointRadius } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex, datasetIndex]
            const [deviceIndex, chartKey, chartIndex, datasetIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex]
            ) {
                const targetDataset = state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex];

                // Update the point radius
                console.log("Updating line point radius with: ", linePointRadius)
                targetDataset.pointRadius = linePointRadius;
            }
        },
        updateLineBoderWidth: (state, action) => {
            const { path, borderWidth } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex, datasetIndex]
            const [deviceIndex, chartKey, chartIndex, datasetIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex]
            ) {
                const targetDataset = state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex];

                // Update the border width
                console.log("Updating line border width with: ", borderWidth)
                targetDataset.borderWidth = borderWidth;
            }
        },
        updateChartTitle: (state, action) => {
            const { path, chartTitle } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex, datasetIndex]
            const [deviceIndex, chartKey, chartIndex, datasetIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex]
            ) {
                const targetDataset = state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.data.datasets[datasetIndex];

                // Update the chart title
                console.log("Updating line chart title: ", chartTitle)
                targetDataset.label = chartTitle;
            }
        },
        toggleLegend: (state, action) => {
            const { path, newState } = action.payload;
           
            const [deviceIndex, chartKey, chartIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0]
            ) {
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.options.plugins.legend.display = newState;
            } else {
                console.error("Invalid path structure for toggling legend:", {
                    deviceIndex,
                    chartKey,
                    chartIndex
                });
            }
        },
        toggleYAxisGrid: (state, action) => {
            const { path, newState } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex]
            const [deviceIndex, layoutIndex, chartIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex]["chart"] &&
                state.devices[deviceIndex].layouts[chartIndex]["chart"][0] &&
                state.devices[deviceIndex].layouts[chartIndex]["chart"][0].config.options.scales.y.grid.display
            ) {
                state.devices[deviceIndex].layouts[chartIndex]["chart"][0].config.options.scales.y.grid.display = newState;
                console.log("New Y axis grid state: ", newState)
            }
        },
        toggleXAxisGrid: (state, action) => {
            const { path, newState } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex]
            const [deviceIndex, layoutIndex, chartIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[layoutIndex] &&
                state.devices[deviceIndex].layouts[layoutIndex]["chart"] &&
                state.devices[deviceIndex].layouts[layoutIndex]["chart"][chartIndex]
            ) {
                state.devices[deviceIndex].layouts[layoutIndex]["chart"][chartIndex].config.options.scales.x.grid.display = newState;
                console.log("New X axis grid state: ", newState)
            }
        },
        toggleYAxisTextDisplay: (state, action) => {
            const { path, newState } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex]
            const [deviceIndex, chartKey, chartIndex] = path;
            console.log("New state: ", newState)
            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0]
            ) {
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.options.scales.y.title.display = newState;
                console.log("New Y axis text display state: ", newState)
            } else {
                console.error("Invalid path structure for toggling Y axis text display:", {
                    deviceIndex,
                    chartKey,
                    chartIndex
                });
            }
        },
        toggleXAxisTextDisplay: (state, action) => {
            const { path, newState } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex]
            const [deviceIndex, chartKey, chartIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0]
            ) {
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.options.scales.x.title.display = newState;
                console.log("New X axis text display state: ", newState)
            } else {
                console.error("Invalid path structure for toggling X axis text display:", {
                    deviceIndex,
                    chartKey,
                    chartIndex
                });
            }
        },
        updateXAxisTitle: (state, action) => {
            const { path, newTitle } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex]
            const [deviceIndex, chartKey, chartIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0]
            ) {
                state.devices[deviceIndex].layouts[chartIndex][chartKey][chartIndex].config.options.scales.x.title.text = newTitle;
                console.log("New X axis title: ", newTitle)
            } else {
                console.error("Invalid path structure for updating X axis title:", {
                    deviceIndex,
                    chartKey,
                    chartIndex
                }); 
            }
        },
        updateYAxisTitle: (state, action) => {
            const { path, newTitle } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex]
            const [deviceIndex, chartKey, chartIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[chartIndex] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey] &&
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0]
            ) {
                state.devices[deviceIndex].layouts[chartIndex][chartKey][0].config.options.scales.y.title.text = newTitle;
                console.log("New Y axis title: ", newTitle)
            } else {
                console.error("Invalid path structure for updating Y axis title:", {
                    deviceIndex,
                    chartKey,
                    chartIndex
                });
            }
        },
        updateYAxisStepSize: (state, action) => {
            const { path, newStepSize } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex]
            const [deviceIndex, layoutIndex, chartIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[layoutIndex] &&
                state.devices[deviceIndex].layouts[layoutIndex].chart &&
                state.devices[deviceIndex].layouts[layoutIndex].chart[chartIndex]
            ) {
                state.devices[deviceIndex].layouts[layoutIndex].chart[chartIndex].config.options.scales.y.ticks.stepSize = newStepSize;
                console.log("New Y axis step size: ", newStepSize)
            }
        },
        updateXAxisTimeUnit: (state, action) => {
            const { path, newTimeUnit } = action.payload;

            // Path: [deviceIndex, layoutIndex, chartIndex]
            const [deviceIndex, layoutIndex, chartIndex] = path;

            // Find the specific layout item and chart
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex].layouts &&
                state.devices[deviceIndex].layouts[layoutIndex] &&
                state.devices[deviceIndex].layouts[layoutIndex].chart &&
                state.devices[deviceIndex].layouts[layoutIndex].chart[chartIndex]
            ) {
                state.devices[deviceIndex].layouts[layoutIndex].chart[chartIndex].config.options.scales.x.time.unit = newTimeUnit;
                console.log("New X axis time unit: ", newTimeUnit)
            }
        },
         clearChanges: (state, action) => {
            const { deviceIndex } = action.payload;
            if (state.devices[deviceIndex]) {
                state.devices[deviceIndex].changes = [];
            }
        }
    },
});

export default devicesSlice.reducer;
export const { 
    addDevice,
    updateChartData,        
    appendChartData, 
    batchAppendChartData,       
    batchUpdateChartData,    
    setActiveDeviceIndex, 
    updateDevice, 
    removeDevice, 
    appendLayout, 
    updateLayout,
    updateLayoutProperties, 
    updateLineBorderColor, 
    updateLineTension,
    updateLinePointRadius,
    updateLineBoderWidth,
    updateChartTitle,
    toggleLegend,
    toggleYAxisGrid,
    toggleXAxisGrid,
    toggleYAxisTextDisplay,
    toggleXAxisTextDisplay,
    updateXAxisTitle,
    updateYAxisTitle,
    updateYAxisStepSize,
    updateXAxisTimeUnit,
    clearChanges 
} = devicesSlice.actions;