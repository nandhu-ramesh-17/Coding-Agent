let intervalId;

function formatTime(time) {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    return timeString;
}

function getSystemTime() {
    try {
        const currentTime = new Date();
        return currentTime;
    } catch (error) {
        console.error('Error fetching system time: ', error);
        return null;
    }
}

function fetchSystemTime() {
    return getSystemTime();
}

function updateTime() {
    const currentTime = fetchSystemTime();
    if (currentTime !== null) {
        const timeString = formatTime(currentTime);
        document.getElementById('time').innerText = timeString;
    }
}

function displayTime() {
    updateTime();
    intervalId = setInterval(updateTime, 1000);
}

function init() {
    displayTime();
}

window.onload = init;