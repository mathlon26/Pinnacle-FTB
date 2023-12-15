// Function to start the bot
async function startBot() {
    let goodToGo = await eel.start_bot()();
    console.log(goodToGo);

    if (goodToGo){
    document.getElementById('activeStatusText').innerText = 'Bot Active';
    document.getElementById('activeStatus').classList.remove('bg-danger');
    document.getElementById('activeStatus').classList.add('bg-success');
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    }
    else
    {
        msgBox("Bot is running, therefor you cannot start him.", "text-danger");
    }
}

// Function to stop the bot
async function stopBot() {
    let goodToGo = await eel.stop_bot()();
    console.log(goodToGo);
    if (goodToGo){
        document.getElementById('activeStatusText').innerText = 'Bot Inactive';
        document.getElementById('activeStatus').classList.remove('bg-success');
        document.getElementById('activeStatus').classList.add('bg-danger');
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    }
    else
    {
        msgBox("Bot is not running, therefor you cannot stop him.", "text-danger");
    }
}

async function getPositions() {
    let positions = await eel.get_positions()();
    return positions;
}

async function getHistory() {
    let history = await eel.get_history(30)();
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
        console.log('+------+');
        console.log(position);
        console.log('+------+');
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
                    console.log(result);
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

setOpenPositionsTable()
setInterval(setOpenPositionsTable, 1500);


async function setHistoryTable() {
    const tableBody = document.getElementById("historyTableBody");
    let history = await getHistory();
    // Clear existing rows
    tableBody.innerHTML = "";
    console.log(history);
    // Iterate through positions and create rows
    history.forEach(position => {
        const row = document.createElement("tr");

        // Create cells and populate with data
        const cells = ["id", "open_time", "symbol", "lotsize", "type", "open_price", "current_price", "profit"];
        cells.forEach(cell => {
            const cellElement = document.createElement("td");

            // Special handling for the "profit" cell to set text color
            if (cell === "profit") {
                cellElement.textContent = position[cell];
                cellElement.classList.add(position[cell] < 0 ? "text-danger" : "text-success");
                cellElement.textContent = position[cell];
            }else {
                cellElement.textContent = position[cell];
            }

            row.appendChild(cellElement);
        });

        // Append the row to the table body
        tableBody.appendChild(row);
    });
}

//setHistoryTable()
//setInterval(setHistoryTable, 1500);
