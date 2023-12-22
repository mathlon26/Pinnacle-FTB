// Global variable to store the currently active timeframe
let activeTimeframe = 'daily';

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
eel.expose(stopBot);
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

