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