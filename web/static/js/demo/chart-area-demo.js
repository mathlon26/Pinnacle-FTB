
/* ========================== */
function getClosestPosition(data, label) {
  const labelTimestamp = new Date(label).getTime();
  let closestPosition = data[data.length -1];
  let timeDifference = Infinity;

  for (const position of data) {
      const positionTimestamp = position.open_time * 1000; // Convert seconds to milliseconds
      const timeDiff = positionTimestamp - labelTimestamp;

      if (timeDiff > 0 && timeDiff < timeDifference) {
          
        closestPosition = position;
        timeDifference = timeDiff;
          
      }
  }
  return closestPosition;
}
/* ========================== */


function loadCharts() {
  const chartD = document.getElementById("BalanceChartD");
  const chartM = document.getElementById("BalanceChartM");
  const chartY = document.getElementById("BalanceChartY");
  chartD.style.display = "block";
  chartM.style.display = "none";
  chartY.style.display = "none";
  surfaceCharting();
}

async function surfaceCharting() {
  datad = await eel.get_history(1)();
  datam = await eel.get_history(30)();
  datay = await eel.get_history(365)();
  
  dailyLineChart(datad); // creates daily chart on the daily canvas
  monthlyLineChart(datam); // creates monthly chart on the monthly canvas
  yearlyLineChart(datay); // creates yearly chart on the yearly canvas

}


let myLineChart;



function dailyLineChart(data) {

    var labels = [];
    var datasetData = [];
    // Get the current date
    let currentDate = new Date();

    // Calculate the date 30 days ago
    let onedayago = new Date(currentDate);
    onedayago.setDate(currentDate.getDate() - 1);

    // Generate labels from the first day of the month to today
    for (let i = 0; i <= 24; i++) {
        let timestamp = onedayago.getTime() + i * 60 * 60 * 1000;
        let newd = new Date(timestamp).toISOString();
        
        labels.push(newd);
    }

    datasetData = labels.map(label => {
      // Here, you may want to find the closest available timestamp in your data
      let closestData = getClosestPosition(data, label);
      let cumulative_profit_now = closestData["bal_after"];
      
      date = label.split("T")[0];
      label = label.split("T")[1];

      label = label.split(".")[0];
      const parts = label.split(":");
      const [hours, minutes, seconds] = parts;

      const dparts = date.split("-");
      const [year, month, day] = dparts;

      const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      return {
        label: `${formattedDate}`,
        value: `${cumulative_profit_now}`
      };
    });
    // Create Chart
  var ctx = document.getElementById("BalanceChartD");
  myLineChartD = new Chart(ctx, {
    type: 'line',
    data: {
      labels: datasetData.map(item => item.label),
      datasets: [{
        label: "Account Balance",
        lineTension: 0.3,
        backgroundColor: "rgba(78, 115, 223, 0.05)",
        borderColor: "rgba(78, 115, 223, 1)",
        pointRadius: 3,
        pointBackgroundColor: "rgba(78, 115, 223, 1)",
        pointBorderColor: "rgba(78, 115, 223, 1)",
        pointHoverRadius: 3,
        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
        pointHitRadius: 10,
        pointBorderWidth: 2,
        data: datasetData.map(item => item.value),
      }],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 7
          }
        }],
        yAxes: [{
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            callback: function(value, index, values) {
              return '$' + value.toFixed(2);
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            return 'Account Balance: $' + tooltipItem.yLabel.toFixed(2);
          }
        }
      }
    }
  });
  }
function monthlyLineChart(data) {
    var labels = [];
    var datasetData = [];
    // Get the current date
    let currentDate = new Date();

    // Calculate the date 30 days ago
    let thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    // Generate labels from the first day of the month to today
    for (let i = 0; i <= 30; i++) {
        let timestamp = thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000;
        let newd = new Date(timestamp).toISOString();
        
        labels.push(newd);
    }

    datasetData = labels.map(label => {
      // Here, you may want to find the closest available timestamp in your data
      let closestData = getClosestPosition(data, label);
      let cumulative_profit_now = closestData["bal_after"];
      label = label.split("T")[0];
      const parts = label.split("-");
      const [year, month, day] = parts;
      const formattedDate = `${day}/${month}/${year}`;
      return {
        label: `${formattedDate}`,
        value: `${cumulative_profit_now}`
      };
    });
  // Create Chart
  var ctx = document.getElementById("BalanceChartM");
  myLineChartM = new Chart(ctx, {
    type: 'line',
    data: {
      labels: datasetData.map(item => item.label),
      datasets: [{
        label: "Account Balance",
        lineTension: 0.3,
        backgroundColor: "rgba(78, 115, 223, 0.05)",
        borderColor: "rgba(78, 115, 223, 1)",
        pointRadius: 3,
        pointBackgroundColor: "rgba(78, 115, 223, 1)",
        pointBorderColor: "rgba(78, 115, 223, 1)",
        pointHoverRadius: 3,
        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
        pointHitRadius: 10,
        pointBorderWidth: 2,
        data: datasetData.map(item => item.value),
      }],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 7
          }
        }],
        yAxes: [{
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            callback: function(value, index, values) {
              return '$' + value.toFixed(2);
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            return 'Account Balance: $' + tooltipItem.yLabel.toFixed(2);
          }
        }
      }
    }
  });
  
}

function yearlyLineChart(data) {
      var labels = [];
      var datasetData = [];
      // Get the current date
      let currentDate = new Date();
  
      // Calculate the date 30 days ago
      let thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(currentDate.getDate() - 365);
  
      // Generate labels from the first day of the month to today
      for (let i = 0; i <= 365; i++) {
          let timestamp = thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000;
          let newd = new Date(timestamp).toISOString();
          
          labels.push(newd);
      }
  
      datasetData = labels.map(label => {
        // Here, you may want to find the closest available timestamp in your data
        let closestData = getClosestPosition(data, label);
        let cumulative_profit_now = closestData["bal_after"];
        label = label.split("T")[0];
        const parts = label.split("-");
        const [year, month, day] = parts;
        const formattedDate = `${day}/${month}/${year}`;
        return {
          label: `${formattedDate}`,
          value: `${cumulative_profit_now}`
        };
      });
  

  // Create Chart
  var ctx = document.getElementById("BalanceChartY");
  myLineChartY = new Chart(ctx, {
    type: 'line',
    data: {
      labels: datasetData.map(item => item.label),
      datasets: [{
        label: "Account Balance",
        lineTension: 0.3,
        backgroundColor: "rgba(78, 115, 223, 0.05)",
        borderColor: "rgba(78, 115, 223, 1)",
        pointRadius: 3,
        pointBackgroundColor: "rgba(78, 115, 223, 1)",
        pointBorderColor: "rgba(78, 115, 223, 1)",
        pointHoverRadius: 3,
        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
        pointHitRadius: 10,
        pointBorderWidth: 2,
        data: datasetData.map(item => item.value),
      }],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 7
          }
        }],
        yAxes: [{
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            callback: function(value, index, values) {
              return '$' + value.toFixed(2);
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            return 'Account Balance: $' + tooltipItem.yLabel.toFixed(2);
          }
        }
      }
    }
  });
}

async function toggleChartTimeframe(timeframe) {
  toggleTimeframe(timeframe);
  const chartD = document.getElementById("BalanceChartD");
  const chartM = document.getElementById("BalanceChartM");
  const chartY = document.getElementById("BalanceChartY");
  chartD.style.display = "none";
  chartM.style.display = "none";
  chartY.style.display = "none";
  if (timeframe === "daily") {chartD.style.display = "block";}
  else if (timeframe === "monthly") {chartM.style.display = "block";}
  else if (timeframe === "yearly") {chartY.style.display = "block";}
  surfaceCharting();
}
