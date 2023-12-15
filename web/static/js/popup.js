function msgBox(message, classToAdd = "") {
    // Log a message indicating the creation of the message box
    console.log("creating msgbox");

    // Get the container element with id 'popup'
    const popupContainer = document.getElementById('popup');

    // Check if there are existing popups
    const hasPopups = Array.from(popupContainer.children).length > 0;

    // Create a new popup element with Bootstrap classes
    const newPopup = document.createElement('div');
    newPopup.classList.add("p-2"); // Add Bootstrap alert classes
    newPopup.innerHTML = `<span class="${classToAdd}">${message}</span>`; // Set the content and optionally add custom classes

    popupContainer.insertBefore(newPopup, popupContainer.firstChild); // Insert the new popup at the beginnings
    popupContainer.style.display = "block"; // Set the display style to 'block' to show the popup

    setTimeout(() => {
        popupContainer.removeChild(newPopup);

        if (Array.from(popupContainer.children).length == 0) {
            popupContainer.style.display = "none";
        }
    }, 3000);
}
