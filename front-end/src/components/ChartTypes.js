import { ReactComponent as LineIcon } from '../assets/charts/line.svg'
import { ReactComponent as BarIcon } from '../assets/charts/bar.svg'
import { ReactComponent as DoughnutIcon } from '../assets/charts/doughnut.svg'
import { ReactComponent as PieIcon } from '../assets/charts/pie.svg'




const chartOptions = {
    line: {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top"
            }
        },
        scales: {
            y: {
                display: true,
                title: {
                    display: false,
                    text: "Beats per minute" // x-axis label
                },
                ticks: {
                    stepSize: 5
                }
            },
            x: {
                type: 'time',
                grid: {
                    display: false
                },
                time: {
                    unit: 'minute',
                    stepSize: 10,
                    min: new Date('2024-10-06T04:00:00').getTime(),  // Start time (replace with dynamic start if needed)
                    max: new Date('2024-10-06T05:00:00').getTime(),  // End time (1-hour window)
                    displayFormats: {
                        minute: 'HH:mm'
                    }
                },
                title: {
                    display: true,
                    text: "Time" // y-axis label
                },
                ticks: {
                    source: 'auto',  // Automatically generate ticks based on time units
                    autoSkip: false  // Ensures 6 divisions appear (no skipping)
                }
            } 
        }
    },
    bar: { 
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    },
    pie: {
        maintainAspectRatio: false,
    },
    doughnut: {
        maintainAspectRatio: false,
    }
}



const chartTypes = {
    Line: {
      type: "Line chart",
      icon: <LineIcon/>,
      minWidth: 300, //px
      minHeight: 150, // px
      data: {
        "datasets": [
            {
                "label": "Line chart",
                "data": [
                    { "x": 1728172800000, "y": 65 },
                    { "x": 1728173400000, "y": 50 },
                    { "x": 1728174000000, "y": 40 },
                    { "x": 1728174600000, "y": 75 },
                    { "x": 1728175200000, "y": 55 },
                    { "x": 1728175800000, "y": 80 },
                    { "x": 1728176400000, "y": 30 }
                ],
                "borderColor": "rgba(75,192,192,1)",
                "backgroundColor": "rgba(75,192,192,0.2)"
            }
        ]
      },
      options: chartOptions.line
    },
    Bar: {
      type:"Bar chart",
      icon: <BarIcon/>,
      minWidth: 300, //px
      minHeight: 150, // px
      data: {
        labels: ["Jan", "Feb", "March", "April", "May", "June", "July"],
        datasets: [{
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
            ],
            borderWidth: 1
        }]
      },
      options: chartOptions.bar
    },
    Pie: {
      type: "Pie chart",
      icon: <PieIcon/>,
      minWidth: 300, //px
      minHeight: 150, // px
      data: {labels: ['Red', 'Blue', 'Yellow'], // Labels for each section of the pie
        datasets: 
        [
          {
            label: 'Colors Distribution',  // Label for the dataset
            data: [30, 50, 20],            // Data representing the size of each slice
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',   // Red
              'rgba(54, 162, 235, 0.6)',   // Blue
              'rgba(255, 206, 86, 0.6)'    // Yellow
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',     // Red border
              'rgba(54, 162, 235, 1)',     // Blue border
              'rgba(255, 206, 86, 1)'      // Yellow border
            ],
            borderWidth: 1                 // Border width for each slice
          }
        ]
    },
      options: chartOptions.pie
    },
    Doughnut: {
      type: "Doughnut chart",
      icon: <DoughnutIcon/>,
      minWidth: 300, //px
      minHeight: 150, // px
      data: {
        labels: ['Apples', 'Oranges', 'Bananas'], // Labels for each section of the doughnut
        datasets: 
        [
            {
                label: 'Fruit Distribution',  // Dataset label
                data: [40, 25, 35],           // Data representing the size of each section
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',  // Apples (Red)
                    'rgba(255, 159, 64, 0.6)',  // Oranges (Orange)
                    'rgba(255, 205, 86, 0.6)'   // Bananas (Yellow)
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',    // Red border
                    'rgba(255, 159, 64, 1)',    // Orange border
                    'rgba(255, 205, 86, 1)'     // Yellow border
                ],
                borderWidth: 1                // Border thickness
            }
        ]
    },
      options: chartOptions.doughnut
    }
}


export default chartTypes;
