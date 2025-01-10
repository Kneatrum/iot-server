




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
                state.devices.push(...action.payload); // Spread array
            } else {
                state.devices.push(action.payload); // Add single object
            }
        },
        setActiveDeviceIndex: (state, action) => {
            const { prevIndex, activeIndex } = action.payload;
            // console.log("Previous: ", state.devices[prevIndex].activeStatus)
            // console.log("Current: ", state.devices[activeIndex].activeStatus)
            state.devices[prevIndex].activeStatus = false; // Set the previous active device to false
            state.devices[activeIndex].activeStatus = true; // Set the active device to true
        },
        updateDevice: (state, action) => {
            const { serial, changes } = action.payload;
            const device = state.devices.find((device) => device.serial === serial);
            device.changes = changes;
        },
        removeDevice: (state, action) => {
            state.devices = state.devices.filter((device) => device.serial !== action.payload);
        },
        appendLayout: (state, action) => {
            const { index, newLayout } = action.payload;
            if (state.devices[index] && Array.isArray(state.devices[index].layouts)) {
                state.devices[index].layouts.push(newLayout);
            } else {
                console.error("Invalid device index or layouts is not an array");
            }
        },
        updateLayout: (state, action) => {
            const { index, newLayout } = action.payload;
            if (state.devices[index] && Array.isArray(state.devices[index].layouts)) {
                state.devices[index].layouts = newLayout;
            } else {
                console.error("Invalid device index or layouts is not an array");
            }
        },
        appendChart: (state, action) => {
            const { index, newChart } = action.payload;
            console.log("appendChart called with:", action.payload);
            if (state.devices[index] && Array.isArray(state.devices[index].charts)) {
                state.devices[index].charts.push(newChart);
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

            // Directly mutate the state as Immer is built into Redux Toolkit
            const [deviceIndex, chartsKey, chartIndex, datasetIndex] = path;

            // Validate path structure
            if (
                state.devices[deviceIndex] &&
                state.devices[deviceIndex][chartsKey] &&
                state.devices[deviceIndex][chartsKey][chartIndex] &&
                state.devices[deviceIndex][chartsKey][chartIndex].data.datasets[datasetIndex]
            ) {
                const targetDataset = state.devices[deviceIndex][chartsKey][chartIndex].data.datasets[datasetIndex];

                // Track changes
                // state.devices[deviceIndex].changes.push({
                //     path,
                //     oldValue: targetDataset.borderColor,
                //     newValue,
                // });

                // Update the borderColor
                targetDataset.borderColor = newValue;
            }
        },
        clearChanges: (state) => {
            state.changes = [];
        }
    },
});

export default devicesSlice.reducer;
export const { 
    addDevice, 
    setActiveDeviceIndex, 
    updateDevice, 
    removeDevice, 
    appendLayout, 
    updateLayout,
    updateLayoutProperties, 
    appendChart,
    updateLineBorderColor, 
    clearChanges 
} = devicesSlice.actions;