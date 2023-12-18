function createAllert(date, msg, icon_name) {
    const count = document.getElementById('alertCount');
    const alertContainer = document.getElementById("dropdownAlerts");
    const alerts = alertContainer.getElementsByClassName('dropdown-item');
    const index = alertContainer.childElementCount;
    // Create a new div element
    const newDiv = document.createElement('div');
    newDiv.classList.add('dropdown-item', 'd-flex', 'align-items-center');
    newDiv.id = index;
    // Set the inner HTML of the new div with the provided parameters
    newDiv.innerHTML = `
        <div class="mr-3">
            <div class="icon-circle bg-primary">
                <i class="fas fa-${icon_name} text-white"></i>
            </div>
        </div>
        <div>
            <div class="small text-gray-500">${date}</div>
            <span class="font-weight-bold">${msg} ${index}</span>
        </div>
        <div>
            <button onClick="deleteAllert(${index})" class="fas fa-trash text-gray-500 bg-transparent border-0"></button>
        </div>
    `;

    // Append the new div to the alert container
    alertContainer.appendChild(newDiv);
    count.innerText = `+${alerts.length}`;
}

function deleteAllert(index) {
    const count = document.getElementById('alertCount');
    const alertContainer = document.getElementById("dropdownAlerts");
    const alerts = alertContainer.getElementsByClassName('dropdown-item');
    const alert = document.getElementById(index.toString());

    alert.remove();
    count.innerText = `+${alerts.length}`;

}

function deleteAllAlerts() {
    const count = document.getElementById('alertCount');
    const alertContainer = document.getElementById("dropdownAlerts");
    const alerts = alertContainer.getElementsByClassName('dropdown-item');

    // Iterate in reverse to avoid issues when removing elements
    for (let i = alerts.length - 1; i >= 0; i--) {
        alerts[i].remove();
    }
    count.innerText = `+${alerts.length}`;
}