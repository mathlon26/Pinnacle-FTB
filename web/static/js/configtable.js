const configTableBody = document.getElementById("configTableBody");

async function loadConfig() {
    console.log("loading config");
    let config = await eel.get_config()();
    console.log(config);
}


function saveConfig() {

}