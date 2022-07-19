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

// Get the Sidebar
var mySidebar = document.getElementById("mySidebar");

// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");
var chart;
var lastUpdate;
const baseUrl = "data.json"; //"https://api.forecast.solar/estimate/{{lat}}/{{lon}}/{{tilt}}/{{azimuth}}/{{power}}";


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



async function getLocation() {
  const spinner = document.getElementById('refresh_icon');
  if(spinner) {
    spinner.classList.add('fa-spin');
  }
  if (navigator.geolocation) {
    const coordinates = await getCoordinates();
    await showForecast(coordinates);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
  if(spinner) {
    spinner.classList.remove('fa-spin');
  }
}

function getCoordinates() {
  return;
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function showForecast(position) {
  // x.innerHTML = "Latitude: " + position.coords.latitude +
  // "<br>Longitude: " + position.coords.longitude;
  const forecast = await getForecast(position);
  setForecast(forecast);
}
async function createTextResults(forecast) {
  console.log(JSON.stringify(forecast, undefined, 2));
  const textResults = document.getElementById('text_results');
  if (textResults) {
    textResults.textContent = JSON.stringify(forecast, undefined, 2);
  }
}

function setForecast(forecast) {
  setHourlyForecast(forecast);
  setDailyForecast(forecast);
  createTextResults(forecast);

}

function setDailyForecast(forecast) {
  const days = Object.keys(forecast.watt_hours_day).map(k => ({ date: k, watt_hours: forecast.watt_hours_day[k] }));
  days.forEach((d, i) => {
    if (!document.getElementById("watt_daily_container_" + i)) {
      return;
    }
    document.getElementById("watt_daily_container_" + i).style.display = 'block';
    document.getElementById("watt_daily_date_" + i).innerText = moment(d.date).format('ddd, DD-MM');
    document.getElementById("watt_daily_watts_" + i).innerText = '' + d.watt_hours / 1000 + 'kWh';
  })
}

function setHourlyForecast(forecast) {
  const dataset = getDataset(forecast);
  // console.log(dataset);

  if (document.getElementById("myChart")) {
    createChart(dataset);
  }
}

async function getForecast(position) {
  const settings = loadSettings();
  // solarWattage
  // solarPanelsTilt
  // solarPanelsAzimuth
  // const lat = settings.specificLocation ? settings.lat: position.coords.latitude;
  // const lon = settings.specificLocation ? settings.lon : position.coords.longitude;
  //"https://api.forecast.solar/estimate/{{lat}}/{{lon}}/{{tilt}}/{{azimuth}}/{{power}}";
  const url = baseUrl;
  // .replaceAll("{{lat}}", lat)
  // .replaceAll("{{lon}}", lon);
  // .replaceAll("{{tilt}}", settings.solarPanelsTilt);
  // .replaceAll("{{azimuth}}", settings.solarPanelsAzimuth);
  // .replaceAll("{{power}}", settings.solarWattage / 1000);
  // console.log(url);
  try {
    const response = await fetch(url);
    // // console.log(response);
    // // console.log();
    const result = await response.json();
    if (result.result) {
      lastUpdate = moment();
      localStorage.setItem('lastUpdate', lastUpdate.toString());
      localStorage.setItem('forecast', JSON.stringify(result));
      return result.result;
    }
  } catch (error) {
    console.error(error);
  }
  console.log('falling back to last response');
  lastUpdate = moment(localStorage.getItem(lastUpdate) || moment());
  return JSON.parse(localStorage.getItem('forecast')).result;
}

function createChart(dataset) {
  const data = {
    datasets: [
      {
        label: "Watt Hours",
        data: dataset,
        parsing: {
          yAxisKey: "watt_hours",
        },
        borderColor: "#0fb4d4",
        backgroundColor: "#0fb4d4",
        // pointRadius: "10",
        // pointBackgroundColor: "#945200",
        // pointBorderColor: "#ff9300",
        pointHoverBackgroundColor: "#ff9300",
        pointHoverBorderColor: "#945200",
      },
      {
        label: "Watts",
        data: dataset,
        parsing: {
          yAxisKey: "watts",
        },
        borderColor: "#ffa3e6",
        backgroundColor: "#ffa3e6",
        // pointRadius: "10",
        // pointBackgroundColor: "#945200",
        // pointBorderColor: "#ff9300",
        pointHoverBackgroundColor: "#ff9300",
        pointHoverBorderColor: "#945200",
      },
    ],
  };
  const config = {
    type: "line",
    data,
    options: {
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
        // Overrides the global setting
        // mode: "index",
      },
      scales: {
        x: {
          ticks: {
            // Include a dollar sign in the ticks
            callback: function (val, index, ticks) {
              return moment(this.getLabelForValue(val)).format(
                "ddd DD/MM HH:mm"
              );
            },
          },
        },
      },
    },
  };
  if (!chart) {
    chart = new Chart(document.getElementById("myChart"), config);
  } else {
    chart.data = data;
    chart.update();
  }
}

function getDataset(data) {
  return Object.keys(data.watts).map((ts) => ({
    x: moment(ts).format("LLLL"),
    watts: data.watts[ts],
    watt_hours: data.watt_hours[ts],
  }));
}

function refresh() {
  getLocation();
}