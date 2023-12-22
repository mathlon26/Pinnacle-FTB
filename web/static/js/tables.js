TABLE_INTERVAL = 1000;


async function getPositions() {
    let positions = await eel.get_positions()();
    return positions;
}

async function getHistory(time) {
    let history = await eel.get_history(time)();
    return history;
}

async function setOpenPositionsTable() {
    const tableBody = document.getElementById("openPositionsTableBody");
    let positions = await getPositions();
    let nPositions = Object.keys(positions).length;
    updatePositionNumber(nPositions);
    // Clear existing rows
    tableBody.innerHTML = "";

    // Iterate through positions and create rows
    positions.forEach(position => {
        const row = document.createElement("tr");
        // Create cells and populate with data
        const cells = ["id", "open_time", "symbol", "lotsize", "type", "open_price", "current_price", "profit", "action"];
        cells.forEach(cell => {
            const cellElement = document.createElement("td");

            // Special handling for the "profit" cell to set text color
            if (cell === "profit") {
                cellElement.textContent = position[cell].toFixed(2);
                cellElement.classList.add(position[cell] < 0 ? "text-danger" : "text-success");
            } else if (cell === "action") {
                // Add a button to close the position
                const closeButton = document.createElement("button");
                closeButton.textContent = "Close Position";
                closeButton.classList.add("btn", "btn-sm", "btn-danger");
                // Create a new Date object
                const currentDate = new Date();

                // Get individual components of the date and time
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
                const day = currentDate.getDate();
                const hours = currentDate.getHours();
                const minutes = currentDate.getMinutes();
                const seconds = currentDate.getSeconds();

                // Format the date and time as a string
                const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                closeButton.onclick = async () => {
                    let history_row = position;
                    let result = await eel.close_position(position["position_id"], position["symbol"], position["lotsize"])();
                    if (result[7] != "") {
                        msgBox(result[7]);
                        result = `Closed position: ${result[7]}`;
                        createAllert(formattedDateTime, result, "arrow");

                    }
                    else {
                        msgBox(result);
                    }
                    setOpenPositionsTable();
                };
                cellElement.appendChild(closeButton);
            }else if (cell == "open_time") {
                unixTimestamp = position[cell];
                let normalTimestamp = new Date(unixTimestamp * 1000).toISOString().substr(0, 19);;
                cellElement.textContent = normalTimestamp.replace("T", " ");
            }
            else if (cell == "profit") {
                cellElement.textContent = position[cell].toFixed(2);
            }
             else {
                cellElement.textContent = position[cell];
            }

            row.appendChild(cellElement);
        });

        // Append the row to the table body
        tableBody.appendChild(row);
    });
}

setOpenPositionsTable();
// Helper function to get history and set the table
async function getHistoryAndSetTable(time) {
    await setHistoryTable(time);
}

// Set the initial timeframe and table on page load
document.addEventListener('DOMContentLoaded', function () {
    getHistoryAndSetTable(30);  // Set default to monthly (you can change this to your desired default)
});

function toggleTimeframe(timeframe) {
    let time = 0;
    switch (timeframe) {
        case 'daily':
            time = 1;
            break;
        case 'monthly':
            time = 30;
            break;
        case 'yearly':
            time = 365;
            break;
        // Add more cases if needed
    }
    
    // Update the active timeframe
    activeTimeframe = timeframe;

    // Call the getHistory function with the selected timeframe
    getHistoryAndSetTable(time);

    // Update the button styles based on the active timeframe
    updateButtonStyles(time);
}

async function setHistoryTable(time) {
    const tableBody = document.getElementById("historyTableBody");
    let history = await getHistory(time);
    // Clear existing rows
    tableBody.innerHTML = "";
    // Iterate through positions and create rows
    history.forEach(position => {

        // Create cells and populate with data
        const cells = ["id", "open_time", "symbol", "lotsize", "type", "open_price", "current_price", "profit"];
        if (position["profit"] != 0)
        {
            const row = document.createElement("tr");

            cells.forEach(cell => {
                const cellElement = document.createElement("td");

                // Special handling for the "profit" cell to set text color
                if (cell === "profit") {
                    cellElement.textContent = position[cell].toFixed(2);
                    cellElement.classList.add(position[cell] < 0 ? "text-danger" : "text-success");
                } else {
                    cellElement.textContent = position[cell];
                }
                if (cell === "symbol") {
                    if (position[cell] === "" && position["profit"] > 0) {
                        cellElement.textContent = "DEPOSIT";
                    }else if (position[cell] === "" && position["profit"] < 0) {
                        cellElement.textContent = "WITHDRAWAL";
                    }
                }
                if (cell == "open_time") {
                    unixTimestamp = position[cell];
                    let normalTimestamp = new Date(unixTimestamp * 1000).toISOString().substr(0, 19);;
                    cellElement.textContent = normalTimestamp.replace("T", " ");
                }
                row.appendChild(cellElement);
            });

            // Append the row to the table body
            tableBody.appendChild(row);
        }
    });
}

// Helper function to update button styles based on the active timeframe
function updateButtonStyles(time) {
    // Remove the 'active' class from all buttons
    const buttons = document.querySelectorAll('.toggleTimeFrameC');
    const buttonsB = document.querySelectorAll('.toggleTimeFrameCB');
    buttonsB.forEach(button => {
        button.classList.remove('active');
    });
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Add the 'active' class to the button corresponding to the active timeframe
    const activeButton = document.querySelector(`.toggleTimeFrameC[data-timeframe="${activeTimeframe}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    const activeButtonB = document.querySelector(`.toggleTimeFrameCB[data-timeframe="${activeTimeframe}"]`);
    if (activeButton) {
        activeButtonB.classList.add('active');
    }
}



setInterval(setOpenPositionsTable, TABLE_INTERVAL);
setInterval(updateSummary, TABLE_INTERVAL);
