eel.expose(stop_all)
function stop_all() {
    window.close();
}
async function botRunning() {
    let status = await eel.get_bot_status("running")()

    return status;
} 
