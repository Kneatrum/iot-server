class LineChartConfigTracker {
  constructor(dispatch, getState) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.changes = new Map(); // Track changes by layout index
    this.originalValues = new Map(); // Store original values for comparison
    
    // Define the properties we want to track with their corresponding actions
    this.trackedProperties = {
      'datasets.0.label': { action: 'updateChartTitle', key: 'chartTitle' },
      'datasets.0.tension': { action: 'updateLineTension', key: 'lineTension' },
      'datasets.0.borderColor': { action: 'updateLineBorderColor', key: 'newValue' },
      'datasets.0.borderWidth': { action: 'updateLineBoderWidth', key: 'borderWidth' },
      'datasets.0.pointRadius': { action: 'updateLinePointRadius', key: 'linePointRadius' },
      'datasets.0.backgroundColor': { action: 'updateDatasetBackgroundColor', key: 'backgroundColor' },
      'datasets.0.pointBackgroundColor': { action: 'updatePointBackgroundColor', key: 'pointBackgroundColor' },
      'options.scales.x.grid.display': { action: 'toggleXAxisGrid', key: 'newState' },
      'options.scales.x.time.unit': { action: 'updateXAxisTimeUnit', key: 'newTimeUnit' },
      'options.scales.x.time.displayFormats.day': { action: 'updateTimeDisplayFormat', key: 'day' },
      'options.scales.x.time.displayFormats.hour': { action: 'updateTimeDisplayFormat', key: 'hour' },
      'options.scales.x.time.displayFormats.week': { action: 'updateTimeDisplayFormat', key: 'week' },
      'options.scales.x.time.displayFormats.month': { action: 'updateTimeDisplayFormat', key: 'month' },
      'options.scales.x.time.displayFormats.minute': { action: 'updateTimeDisplayFormat', key: 'minute' },
      'options.scales.x.type': { action: 'updateXAxisType', key: 'axisType' },
      'options.scales.x.ticks.source': { action: 'updateXAxisTicksSource', key: 'ticksSource' },
      'options.scales.x.title.text': { action: 'updateXAxisTitle', key: 'newTitle' },
      'options.scales.x.title.display': { action: 'toggleXAxisTextDisplay', key: 'newState' },
      'options.scales.x.beginAtZero': { action: 'updateXAxisBeginAtZero', key: 'beginAtZero' },
      'options.scales.y.grid.display': { action: 'toggleYAxisGrid', key: 'newState' },
      'options.scales.y.ticks.stepSize': { action: 'updateYAxisStepSize', key: 'newStepSize' },
      'options.scales.y.title.text': { action: 'updateYAxisTitle', key: 'newTitle' },
      'options.scales.y.title.display': { action: 'toggleYAxisTextDisplay', key: 'newState' },
      'options.scales.y.display': { action: 'toggleYAxisDisplay', key: 'display' },
      'options.scales.y.beginAtZero': { action: 'updateYAxisBeginAtZero', key: 'beginAtZero' },
      'options.plugins.legend.display': { action: 'toggleLegend', key: 'newState' },
      'options.plugins.legend.position': { action: 'updateLegendPosition', key: 'position' },
      'options.maintainAspectRatio': { action: 'updateMaintainAspectRatio', key: 'maintainAspectRatio' }
    };
    
    this.initializeOriginalValues();
  }

  // Helper method to get nested object value using dot notation
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Get current state data
  getData() {
    return this.getState().devices.devices;
  }

  // Initialize original values for all tracked properties
  initializeOriginalValues() {
    const devices = this.getData();
    devices.forEach((device, deviceIndex) => {
      device.layouts.forEach((layout, layoutIndex) => {
        const chartConfig = layout.chart[0].config;
        const key = `${deviceIndex}-${layoutIndex}`;
        
        if (!this.originalValues.has(key)) {
          this.originalValues.set(key, {});
        }
        
        const original = this.originalValues.get(key);
        
        Object.keys(this.trackedProperties).forEach(prop => {
          const currentValue = this.getNestedValue(chartConfig, prop);
          if (currentValue !== undefined) {
            original[prop] = JSON.parse(JSON.stringify(currentValue)); // Deep copy
          }
        });
      });
    });
  }

  // Update a specific property using Redux actions
  updateProperty(deviceIndex, layoutIndex, property, newValue) {
    if (!this.trackedProperties[property]) {
      throw new Error(`Property "${property}" is not being tracked`);
    }

    const devices = this.getData();
    const device = devices[deviceIndex];
    if (!device) {
      throw new Error(`Device at index ${deviceIndex} not found`);
    }

    const layout = device.layouts[layoutIndex];
    if (!layout) {
      throw new Error(`Layout at index ${layoutIndex} not found`);
    }

    const chartConfig = layout.chart[0].config;
    const oldValue = this.getNestedValue(chartConfig, property);
    
    // Get the action configuration for this property
    const actionConfig = this.trackedProperties[property];
    
    // Create the payload for the Redux action
    const payload = {
      path: [deviceIndex, 'chart', layoutIndex, 0], // Standard path format for your actions
      [actionConfig.key]: newValue
    };

    // Handle special cases that might need different payload structures
    if (property.startsWith('options.scales.x.time.displayFormats.')) {
      const timeUnit = property.split('.').pop();
      payload.timeUnit = timeUnit;
      payload.format = newValue;
    }

    // Dispatch the appropriate Redux action
    this.dispatch({
      type: `devices/${actionConfig.action}`,
      payload: payload
    });
    
    // Track the change for database persistence
    this.trackChange(deviceIndex, layoutIndex, property, oldValue, newValue);
    
    return true;
  }

  // Update multiple properties at once
  updateProperties(deviceIndex, layoutIndex, updates) {
    const changes = [];
    
    for (const [property, newValue] of Object.entries(updates)) {
      try {
        const devices = this.getData();
        const oldValue = this.getNestedValue(
          devices[deviceIndex].layouts[layoutIndex].chart[0].config, 
          property
        );
        
        this.updateProperty(deviceIndex, layoutIndex, property, newValue);
        changes.push({ property, oldValue, newValue });
      } catch (error) {
        console.error(`Failed to update ${property}:`, error.message);
      }
    }
    
    return changes;
  }

  // Track a change for database persistence
  trackChange(deviceIndex, layoutIndex, property, oldValue, newValue) {
    const key = `${deviceIndex}-${layoutIndex}`;
    const devices = this.getData();
    
    if (!this.changes.has(key)) {
      this.changes.set(key, {
        deviceIndex,
        layoutIndex,
        deviceId: devices[deviceIndex].userId,
        chartId: devices[deviceIndex].layouts[layoutIndex].chart[0].config.id,
        properties: new Map(),
        timestamp: new Date().toISOString()
      });
    }
    
    const layoutChanges = this.changes.get(key);
    layoutChanges.properties.set(property, {
      oldValue: oldValue,
      newValue: newValue,
      timestamp: new Date().toISOString()
    });
    
    // Update the overall timestamp
    layoutChanges.timestamp = new Date().toISOString();
  }

  // Get all changes for a specific layout
  getChanges(deviceIndex, layoutIndex) {
    const key = `${deviceIndex}-${layoutIndex}`;
    const changes = this.changes.get(key);
    
    if (!changes) {
      return null;
    }
    
    return {
      ...changes,
      properties: Object.fromEntries(changes.properties)
    };
  }

  // Get all changes across all layouts
  getAllChanges() {
    const allChanges = {};
    
    for (const [key, changes] of this.changes) {
      allChanges[key] = {
        ...changes,
        properties: Object.fromEntries(changes.properties)
      };
    }
    
    return allChanges;
  }

  // Check if there are any changes
  hasChanges(deviceIndex = null, layoutIndex = null) {
    if (deviceIndex !== null && layoutIndex !== null) {
      const key = `${deviceIndex}-${layoutIndex}`;
      return this.changes.has(key);
    }
    
    return this.changes.size > 0;
  }

  // Clear changes after successful database write
  clearChanges(deviceIndex = null, layoutIndex = null) {
    if (deviceIndex !== null && layoutIndex !== null) {
      const key = `${deviceIndex}-${layoutIndex}`;
      this.changes.delete(key);
      
      // Also clear Redux changes
      this.dispatch({
        type: 'devices/clearChanges',
        payload: { deviceIndex }
      });
      return;
    }
    
    // Clear all changes
    this.changes.clear();
    
    // Clear all Redux changes
    const devices = this.getData();
    devices.forEach((device, index) => {
      this.dispatch({
        type: 'devices/clearChanges',
        payload: { deviceIndex: index }
      });
    });
  }

  // Get changes formatted for database insertion
  getChangesForDatabase() {
    const dbRecords = [];
    
    for (const [key, changes] of this.changes) {
      for (const [property, change] of changes.properties) {
        dbRecords.push({
          deviceId: changes.deviceId,
          chartId: changes.chartId,
          deviceIndex: changes.deviceIndex,
          layoutIndex: changes.layoutIndex,
          property: property,
          oldValue: change.oldValue,
          newValue: change.newValue,
          timestamp: change.timestamp
        });
      }
    }
    
    return dbRecords;
  }

  // Write changes to database
  async writeToDatabase() {
    if (!this.hasChanges()) {
      console.log('No changes to write to database');
      return [];
    }

    const records = this.getChangesForDatabase();
    
    try {
      // Simulate async database operation
      console.log('Writing changes to database...', records);
      
      // Here you would typically make your database call
      // const result = await yourDatabaseService.insertChanges(records);
      
      // For demonstration, we'll just log the records
      console.log(`Successfully wrote ${records.length} change records to database`);
      
      // Clear changes after successful write
      this.clearChanges();
      
      return records;
    } catch (error) {
      console.error('Failed to write changes to database:', error);
      throw error;
    }
  }

  // Get current configuration for a specific chart
  getCurrentConfig(deviceIndex, layoutIndex) {
    const devices = this.getData();
    const device = devices[deviceIndex];
    if (!device) return null;
    
    const layout = device.layouts[layoutIndex];
    if (!layout) return null;
    
    return layout.chart[0].config;
  }

  // Reset a property to its original value
  resetProperty(deviceIndex, layoutIndex, property) {
    const key = `${deviceIndex}-${layoutIndex}`;
    const original = this.originalValues.get(key);
    
    if (original && original[property] !== undefined) {
      this.updateProperty(deviceIndex, layoutIndex, property, original[property]);
      return true;
    }
    
    return false;
  }

  // Reset all properties for a chart to their original values
  resetChart(deviceIndex, layoutIndex) {
    const key = `${deviceIndex}-${layoutIndex}`;
    const original = this.originalValues.get(key);
    
    if (!original) return false;
    
    for (const [property, value] of Object.entries(original)) {
      this.updateProperty(deviceIndex, layoutIndex, property, value);
    }
    
    return true;
  }
}

// Usage example with Redux:
// 
// import { useDispatch, useSelector } from 'react-redux';
// import ChartConfigTracker from './ChartConfigTracker';
// 
// function YourComponent() {
//   const dispatch = useDispatch();
//   const getState = useSelector(state => state);
//   
//   // Initialize tracker
//   const tracker = new ChartConfigTracker(dispatch, () => getState);
//   
//   // Update properties - this will automatically dispatch Redux actions
//   const handleUpdateChart = () => {
//     tracker.updateProperties(0, 0, {
//       'datasets.0.borderColor': '#ff0000',
//       'datasets.0.borderWidth': 3,
//       'options.plugins.legend.display': false
//     });
//   };
//   
//   // Save changes to database when button is pressed
//   const handleSaveChanges = async () => {
//     if (tracker.hasChanges()) {
//       try {
//         await tracker.writeToDatabase();
//         console.log('Changes saved successfully!');
//       } catch (error) {
//         console.error('Failed to save changes:', error);
//       }
//     }
//   };
//   
//   return (
//     <div>
//       <button onClick={handleUpdateChart}>Update Chart</button>
//       <button onClick={handleSaveChanges}>Save Changes</button>
//     </div>
//   );
// }

export default LineChartConfigTracker;