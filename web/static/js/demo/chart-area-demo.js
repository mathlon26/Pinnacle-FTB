function createChart(timeframe, data) {
  var labels = [];
  var datasetData = [];
  
  if (timeframe === 'daily') {
    // Get the current date
    var currentDate = new Date().toISOString().split('T')[0];
  
    // Generate labels every 30 minutes
    for (let i = 0; i < 24; i++) {
      let timestamp = new Date(currentDate + 'T00:00:00Z').getTime() + i* 60 * 60 * 1000;
      let newt = new Date(timestamp).toISOString().split('T')[1];
      
      labels.push(newt.split("0Z")[0]);
    }
  
    const initial_balance = data.info["equity"] - parseFloat(data.daily["total_profit"]);
    let done = [];
    datasetData = labels.map(label => {
      // Here, you may want to find the closest available timestamp in your data
      let closestTimestamp = findClosestTimestamp(label, Object.keys(data.daily[currentDate]));
      let cumulative_profit_now = data.daily[currentDate][closestTimestamp]["cumulative_profit_now"];
      let value;
      if (done.includes(closestTimestamp)) {
        let temp = label.split("00:")[1];
        let hour = parseInt(temp.split(":00")[0]);
        if (hour != NaN) {
          hour = hour -1;
          hour = hour.length === 2 ? hour.toString() :`0${hour.toString()}`; 
          prevLabel = `${hour}:00:00`;
          console.log(prevLabel);
          value = datasetData.find(item => item === prevLabel)?.value;
        }        
      }
      else {
        done.push({label: closestTimestamp});
        value = initial_balance + cumulative_profit_now;
      }
      console.log({"label": label, "value": value, "cts": closestTimestamp});
      return {
        label: `${label}`,
        value: `${value}`
      };
    });
  }
  else if (timeframe === 'monthly') {
    // Get the current date
    let currentDate = new Date();
    let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Generate labels from the first day of the month to today
    for (let i = 0; i <= currentDate.getDate(); i++) {
        let timestamp = firstDayOfMonth.getTime() + i * 24 * 60 * 60 * 1000;
        let newd = new Date(timestamp).toISOString().split('T')[0];
        
        labels.push(newd);
    }

console.log(labels);


    console.log(labels);
    const initial_balance = data.info["equity"] - parseFloat(data.monthly["total_profit"]);
    let done = [];
    datasetData = labels.map(label => {
      // Here, you may want to find the closest available timestamp in your data
      let closestTimestamp = findClosestTimestamp("23:00:00", Object.keys(data.monthly[label]));
      let cumulative_profit_now = data.monthly[label][closestTimestamp]["cumulative_profit_now"];
      let value = initial_balance + cumulative_profit_now;
      
      console.log({"label": label, "value": value, "cts": closestTimestamp});
      return {
        label: `${label}`,
        value: `${value}`
      };
    });
  }

  
  function findClosestTimestamp(label, timestamps) {
    label = label.split(".")[0];
    let temp = label.split(":");
    let hour = parseInt(temp[0]);
    let closestKey = null;
    let closesttimestampMinute = 0;
    let closesttimestampSecond = 0;
    let closesttimestampLevel = 0;
    let closestDiffH = Infinity;



    for (let timestamp of timestamps) {
        let t = timestamp.split(":");
        let timestampHour = parseInt(t[0]);
        let timestampMinute = parseInt(t[1]);
        let timestampSecond = parseInt(t[2].slice(0,2));
        let timestampLevel = parseInt(t[2].slice(2,3) || 0);

        let diffH = timestampHour - hour;

        if (diffH < closestDiffH && diffH <= 0) {
            closestKey = timestamp;
            closesttimestampMinute = timestampMinute;
            closesttimestampSecond = timestampSecond;
            closesttimestampLevel = timestampLevel;
            closestDiff = diffH;
        }
        else if (diffH === closestDiffH) { 
            if (timestampMinute > closesttimestampMinute) {
                closestKey = timestamp;
                closesttimestampMinute = timestampMinute;
                closesttimestampSecond = timestampSecond;
                closesttimestampLevel = timestampLevel;
                closestDiff = diffH;
            }
            else if (timestampMinute === closesttimestampMinute) {
                if (timestampSecond > closesttimestampSecond) {
                    closestKey = timestamp;
                    closesttimestampMinute = timestampMinute;
                    closesttimestampSecond = timestampSecond;
                    closesttimestampLevel = timestampLevel;
                    closestDiff = diffH;
                }
                else if (timestampSecond === closesttimestampSecond) {
                    if (timestampLevel > closesttimestampLevel) {
                        closestKey = timestamp;
                        closesttimestampMinute = timestampMinute;
                        closesttimestampSecond = timestampSecond;
                        closesttimestampLevel = timestampLevel;
                        closestDiff = diffH;
                    }
                }
            }
        }
    }
    console.log(`${label}, ${closestKey}`);


    return closestKey;
  }
  

  // Create Chart
  var ctx = document.getElementById("BalanceChart");
  var myLineChart = new Chart(ctx, {
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

