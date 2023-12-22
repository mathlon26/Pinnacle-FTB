const dailyEarnings = document.getElementById("daily-earnings");
const monthlyEarnings = document.getElementById("monthly-earnings");
const yearlyEarnings = document.getElementById("yearly-earnings");

const currentEquity = document.getElementById("current-equity");
const equityProgress = document.getElementById("equityProgress");
const totalPositions = document.getElementById("total-positions");


function updatePositionNumber(n) {
    totalPositions.innerText = n;
}

function updateSummary() {
    updateCurrentEquity();
    updateDailyEarnings();
    updateMonthlyEarnings();
    updateYearlyEarnings();
}

async function updateCurrentEquity() {
    let config = await eel.get_config()();
    let account_financials = await eel.get_account_financials()();
    let goal = config["account"]["monthly-goal"];

    let percentage = (account_financials["profit"]["30"] / goal * 100);
    currentEquity.innerText = `${account_financials["equity"].toFixed(2)} ${account_financials["currency"]}`;
    let cssSyntax = `${percentage}%`;
    
    equityProgress.style.width = cssSyntax;
}

async function updateDailyEarnings() {
    let account_financials = await eel.get_account_financials()();

    let initial = account_financials["initial-balance"]["1"];
    let percentage = (account_financials["profit"]["1"] / initial * 100).toFixed(2);
    if (percentage != Infinity && percentage != "NaN") {
        dailyEarnings.innerText = `${percentage}%`;

        if (percentage > 0) {
            dailyEarnings.classList.add("text-success");
            dailyEarnings.classList.remove("text-danger");
        }else{
            dailyEarnings.classList.remove("text-success");
            dailyEarnings.classList.add("text-danger");
        }
    }
    else{
        dailyEarnings.innerText = `0%`;
    }
    
}

async function updateMonthlyEarnings() {
    let account_financials = await eel.get_account_financials()();

    let initial = account_financials["initial-balance"]["30"];
    let percentage = (account_financials["profit"]["30"] / initial  * 100).toFixed(2);
    if (percentage != Infinity && percentage != "NaN") {
        monthlyEarnings.innerText = `${percentage}%`;

        if (percentage > 0) {
            monthlyEarnings.classList.add("text-success");
            monthlyEarnings.classList.remove("text-danger");
        }else{
            monthlyEarnings.classList.remove("text-success");
            monthlyEarnings.classList.add("text-danger");
        }
    }
    else{
        monthlyEarnings.innerText = `0%`;
    }
    
}

async function updateYearlyEarnings() {
    let account_financials = await eel.get_account_financials()();

    let initial = account_financials["initial-balance"]["365"];
    let percentage = (account_financials["profit"]["365"] / initial * 100).toFixed(2);
    if (percentage != Infinity && percentage != "NaN") {
        yearlyEarnings.innerText = `${percentage}%`;

        if (percentage > 0) {
            yearlyEarnings.classList.add("text-success");
            yearlyEarnings.classList.remove("text-danger");
        }else{
            yearlyEarnings.classList.remove("text-success");
            yearlyEarnings.classList.add("text-danger");
        }
    }
    else{
        yearlyEarnings.innerText = `0%`;
    }
    
}


