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
                beginAtZero: false,
                grid: {
                    display: true
                },
                title: {
                    display: true,
                    text: "Beats per minute" // x-axis label
                },
                ticks: {
                    stepSize: 5
                }
            },
            x: {
                type: 'time',
                beginAtZero: false,
                grid: {
                    display: true
                },
                time: {
                    unit: 'minute',
                    // stepSize: 1,
                    // min: new Date('2024-12-19T11:00:00').getTime(),  // Start time (replace with dynamic start if needed)
                    // max: new Date('2024-12-19T12:20:00').getTime(),  // End time (1-hour window)
                    displayFormats: {
                        minute: 'HH:mm',
                        hour: 'HH:00',
                        day: 'MMM d',
                        week: 'MMM d',
                        month: 'MMM yyyy'
                    }
                },
                title: {
                    display: true,
                    text: "Time" // y-axis label
                },
                ticks: {
                    source: 'labels',  // Automatically generate ticks based on time units
                    // autoSkip: false  // Ensures 6 divisions appear (no skipping)
                    // maxTicksLimit: 10,
                    callback: function (value, index, values) {
                        const chartUnit = this.chart.options.scales.x.time.unit;

                        if (chartUnit === "hour") {
                        // Only show ticks if they represent the top of the hour
                            const date = new Date(value);
                            if (date.getMinutes() === 0) {
                                return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            }
                            return ""; // Skip ticks that are not on the hour
                        }
                        
                        if (chartUnit === "minute") {
                            return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        }
                      return null; // Skip ticks for other time units
                    }
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
        labels: [
            1728151200000, // 10:00
            1728152400000, // 10:20
            1728153600000, // 10:40
            1728154800000, // 11:00
            1728156000000, // 11:20
            1728157200000, // 11:40
            1728158400000, // 12:00
            1728159600000, // 12:20
            1728160800000, // 12:40
            1728162000000, // 13:00
            ],
        datasets: [
            {
                label: "Sample Dataset",
                data: [12, 5, 18, 9, 3, 17, 7, 11, 20, 4],
                borderColor: "#007bff",
                backgroundColor: "rgba(0, 123, 255, 0.3)",
                borderWidth: 2,
                tension: 0,
                pointBackgroundColor: "#007bff",
                pointRadius: 0,
            },
        ],
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
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
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
      data: {
        labels: ['Red', 'Blue', 'Yellow'], // Labels for each section of the pie
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
                'rgba(255, 99, 132, 0.6)',   // Red
                'rgba(54, 162, 235, 0.6)',   // Blue
                'rgba(255, 206, 86, 0.6)'    // Yellow
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
