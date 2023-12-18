// Global variable to store the currently active timeframe
let activeTimeframe = 'monthly';

// Function to start the bot
async function startBot() {
    let goodToGo = await eel.start_bot()();

    if (goodToGo){
        document.getElementById('activeStatusText').innerText = 'Bot Active';
        document.getElementById('activeStatus').classList.remove('bg-danger');
        document.getElementById('activeStatus').classList.add('bg-success');
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
    } else {
        msgBox("Bot is running, therefore you cannot start him.", "text-danger");
    }
}

// Function to stop the bot
async function stopBot() {
    let goodToGo = await eel.stop_bot()();
    if (goodToGo){
        document.getElementById('activeStatusText').innerText = 'Bot Inactive';
        document.getElementById('activeStatus').classList.remove('bg-success');
        document.getElementById('activeStatus').classList.add('bg-danger');
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    } else {
        msgBox("Bot is not running, therefore you cannot stop him.", "text-danger");
    }
}

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
                cellElement.textContent = position[cell];
                cellElement.classList.add(position[cell] < 0 ? "text-danger" : "text-success");
            } else if (cell === "action") {
                // Add a button to close the position
                const closeButton = document.createElement("button");
                closeButton.textContent = "Close Position";
                closeButton.classList.add("btn", "btn-sm", "btn-danger");
                
                closeButton.onclick = async () => {
                    let result = await eel.close_position(position["position_id"], position["symbol"], position["lotsize"])();
                    if (result[7] != "") {
                        msgBox(result[7]);
                    }
                    else {
                        msgBox(result);
                    }
                    setOpenPositionsTable();
                };
                cellElement.appendChild(closeButton);
            } else {
                cellElement.textContent = position[cell];
            }

            row.appendChild(cellElement);
        });

        // Append the row to the table body
        tableBody.appendChild(row);
    });
}

setOpenPositionsTable();
setInterval(setOpenPositionsTable, 6000);

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
                    cellElement.textContent = position[cell];
                    cellElement.classList.add(position[cell] < 0 ? "text-danger" : "text-success");
                } else {
                    cellElement.textContent = position[cell];
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
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Add the 'active' class to the button corresponding to the active timeframe
    const activeButton = document.querySelector(`.toggleTimeFrameC[data-timeframe="${activeTimeframe}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}