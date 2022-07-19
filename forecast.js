const defaultSettings = {
    solarWattage: 1000,
    solarPanelsTilt: 0,
    solarPanelsAzimuth: 0,
    specificLocation: false,
    lat: 0,
    lon: 0,
}

// Get the Sidebar
var mySidebar = document.getElementById("mySidebar");

// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");

// Toggle between showing and hiding the sidebar, and add overlay effect
function w3_open() {
    if (mySidebar.style.display === "block") {
        mySidebar.style.display = "none";
        overlayBg.style.display = "none";
    } else {
        mySidebar.style.display = "block";
        overlayBg.style.display = "block";
    }
}

// Close the sidebar with the close button
function w3_close() {
    mySidebar.style.display = "none";
    overlayBg.style.display = "none";
}

function loadSettings() {
    return JSON.parse(localStorage.getItem('settings') || 'null') || defaultSettings;
}

function saveSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}