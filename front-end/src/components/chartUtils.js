// chartUtils.js
import chartTypes from './ChartTypes';

export const serializeChartData = (chart) => {
  // Extract only serializable properties from the chart
  return {
    id: chart.id,
    type: chart.type,
    data: {
      labels: chart.data.labels,
      datasets: chart.data.datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor,
        borderColor: dataset.borderColor,
        borderWidth: dataset.borderWidth,
        tension: dataset.tension,
        pointBackgroundColor: dataset.pointBackgroundColor,
        pointRadius: dataset.pointRadius
      }))
    },
    // Store serializable options
    options: {
      maintainAspectRatio: chart.options.maintainAspectRatio,
      plugins: {
        legend: {
          display: chart.options.plugins?.legend?.display,
          position: chart.options.plugins?.legend?.position
        }
      },
      scales: {
        y: {
          display: chart.options.scales?.y?.display,
          beginAtZero: chart.options.scales?.y?.beginAtZero,
          grid: {
            display: chart.options.scales?.y?.grid?.display
          },
          title: {
            display: chart.options.scales?.y?.title?.display,
            text: chart.options.scales?.y?.title?.text
          },
          ticks: {
            stepSize: chart.options.scales?.y?.ticks?.stepSize
          }
        },
        x: {
          type: chart.options.scales?.x?.type,
          beginAtZero: chart.options.scales?.x?.beginAtZero,
          grid: {
            display: chart.options.scales?.x?.grid?.display
          },
          time: chart.options.scales?.x?.time ? {
            unit: chart.options.scales?.x?.time?.unit,
            displayFormats: chart.options.scales?.x?.time?.displayFormats
          } : undefined,
          title: {
            display: chart.options.scales?.x?.title?.display,
            text: chart.options.scales?.x?.title?.text
          },
          ticks: {
            source: chart.options.scales?.x?.ticks?.source
          }
        }
      }
    }
  };
};

export const deserializeChartData = (serializedChart) => {
  // Get the base chart configuration from chartTypes
  const baseChartConfig = chartTypes[serializedChart.type];
  
  // Reconstruct the chart with all necessary properties
  const deserializedChart = {
    ...serializedChart,
    options: {
      ...baseChartConfig.options,
      maintainAspectRatio: serializedChart.options.maintainAspectRatio,
      plugins: {
        legend: {
          ...baseChartConfig.options.plugins?.legend,
          ...serializedChart.options.plugins?.legend
        }
      },
      scales: {
        y: {
          ...baseChartConfig.options.scales?.y,
          ...serializedChart.options.scales?.y,
          grid: {
            ...baseChartConfig.options.scales?.y?.grid,
            ...serializedChart.options.scales?.y?.grid
          },
          title: {
            ...baseChartConfig.options.scales?.y?.title,
            ...serializedChart.options.scales?.y?.title
          },
          ticks: {
            ...baseChartConfig.options.scales?.y?.ticks,
            ...serializedChart.options.scales?.y?.ticks
          }
        },
        x: {
          ...baseChartConfig.options.scales?.x,
          ...serializedChart.options.scales?.x,
          grid: {
            ...baseChartConfig.options.scales?.x?.grid,
            ...serializedChart.options.scales?.x?.grid
          },
          time: serializedChart.options.scales?.x?.time ? {
            ...baseChartConfig.options.scales?.x?.time,
            ...serializedChart.options.scales?.x?.time,
          } : undefined,
          title: {
            ...baseChartConfig.options.scales?.x?.title,
            ...serializedChart.options.scales?.x?.title
          },
          ticks: {
            ...baseChartConfig.options.scales?.x?.ticks,
            source: serializedChart.options.scales?.x?.ticks?.source,
            // Restore the callback function for time formatting
            callback: baseChartConfig.options.scales?.x?.ticks?.callback
          }
        }
      }
    }
  };

  return deserializedChart;
};

// Helper function to create a new chart instance
export const createNewChart = (type, componentId) => {
  const baseChart = {
    id: componentId,
    type,
    data: chartTypes[type].data,
    options: chartTypes[type].options,
  };

  return serializeChartData(baseChart);
};