async function loadConfig() {
    console.log("loading config");
    let config = await eel.get_config()();
    console.log(config);
    
    const tableBody = document.getElementById("configTableBody");

    for (const category in config) {
        if (config.hasOwnProperty(category)) {
            const settings = config[category];

            // Add category title row
            const categoryRow = tableBody.insertRow();
            const cellCategory = categoryRow.insertCell(0);
            cellCategory.colSpan = 3;
            cellCategory.textContent = category;
            cellCategory.classList.add("category-title");
            cellCategory.classList.add("bg-primary");

            

            // Add settings rows
            for (const setting in settings) {
                if (settings.hasOwnProperty(setting)) {
                    const value = settings[setting];

                    const row = tableBody.insertRow();
                    const cellSetting = row.insertCell(0);
                    const cellValue = row.insertCell(1);

                    cellSetting.textContent = setting;

                    if (typeof value === "boolean") {
                        // Display checkboxes for boolean values
                        const checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.checked = value;
                        checkbox.disabled = false;
                        checkbox.classList.add("checkbox-cell");
                        cellValue.appendChild(checkbox);
                    } else if (typeof value === "string" || typeof value === "number") {
                        // Display editable input for strings and numbers
                        const input = document.createElement("input");
                        input.type = "text";
                        input.value = value;
                        input.classList.add("editable-input");
                        cellValue.appendChild(input);
                    } else if (Array.isArray(value)) {
                        // Display editable list with delete option
                        const editableDiv = document.createElement("div");
                        editableDiv.classList.add("editable-cell");

                        value.forEach((item, index) => {
                            if (item != '') {
                                const itemDiv = document.createElement("div");
                                const itemValue = document.createElement("span");
                                itemValue.textContent = item;
                                const deleteButton = document.createElement("span");
                                deleteButton.textContent = " X ";
                                deleteButton.classList.add("delete-item");
                                deleteButton.addEventListener("click", () => {
                                    // Remove item from the list
                                    value.splice(index, 1);
                                    // Update the displayed list
                                    renderList(value, editableDiv);
                                });
                                itemDiv.appendChild(itemValue);
                                itemDiv.appendChild(deleteButton);
                                editableDiv.appendChild(itemDiv);
                            }  
                        });

                        const addItemInput = document.createElement("input");
                        addItemInput.type = "text";
                        addItemInput.placeholder = "Add new item";
                        addItemInput.addEventListener("keydown", (event) => {
                            if (event.key === "Enter") {
                                // Add new item to the list
                                value.push(addItemInput.value);
                                // Clear the input
                                addItemInput.value = "";
                                // Update the displayed list
                                renderList(value, editableDiv);
                            }
                        });

                        editableDiv.appendChild(addItemInput);
                        cellValue.appendChild(editableDiv);
                    }
                }
            }
        }
    }

    function renderList(list, container) {
        // Clear the container
        container.innerHTML = "";

        // Display the updated list
        list.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.textContent = item;

            const deleteButton = document.createElement("span");
            deleteButton.textContent = " X ";
            deleteButton.classList.add("delete-item");
            deleteButton.addEventListener("click", () => {
                // Remove item from the list
                list.splice(index, 1);
                // Update the displayed list
                renderList(list, container);
            });

            itemDiv.appendChild(deleteButton);
            container.appendChild(itemDiv);
        });

        // Add input for adding new items
        const addItemInput = document.createElement("input");
        addItemInput.type = "text";
        addItemInput.placeholder = "Add new item";
        addItemInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                // Add new item to the list
                list.push(addItemInput.value);
                // Clear the input
                addItemInput.value = "";
                // Update the displayed list
                renderList(list, container);
            }
        });

        container.appendChild(addItemInput);
    }
}


async function saveConfig() {
    let isBotRunning = await botRunning();
    if (!isBotRunning) {
        console.log('saving config');
        // Collect data from the table and format it into a JavaScript object
        const updatedConfig = collectConfigData();
    
        const jsonText = JSON.stringify(updatedConfig);
    
        eel.save_config(jsonText)();
    }
    else
    {
        msgBox("Cannot save config while the bot is running.", "text-danger");
        loadConfig();
    }
    
}
function collectConfigData() {
    const tableBody = document.getElementById("configTableBody");
    const updatedConfig = {};

    let currentCategory = null;

    // Iterate through each row in the table
    for (let i = 0; i < tableBody.rows.length; i++) {
        const row = tableBody.rows[i];

        // Check if it's a category title row
        if (row.cells.length === 1) {
            currentCategory = row.cells[0].textContent;
            updatedConfig[currentCategory] = {};
        } else {
            // It's a setting row
            const setting = row.cells[0].textContent;
            let cellValue = row.cells[1].querySelector('input, div');

            let value;

            if (cellValue.tagName.toLowerCase() === 'input') {
                if (cellValue.type === 'checkbox') {
                    // If it's a checkbox, store its checked state as a boolean
                    value = cellValue.checked;
                } else {
                    // If it's an input, get the input value
                    value = cellValue.value;
                }
            } else if (cellValue.tagName.toLowerCase() === 'div') {
                // If it's a div, value is equal to the first span in the div
                value = Array.from(cellValue.children)
                    .map(div => div.textContent)
                    .filter(item => item !== '')
                    .map(item => item.split(" ")[0]);
            }

            // Add the setting to the updatedConfig
            updatedConfig[currentCategory][setting] = value;
        }
    }

    return updatedConfig;
}
