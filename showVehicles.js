// ✅ Store gauges globally
const gauges = {};

function createGauge(canvasId, label, value, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const gauge = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [label, ''],
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [color, "#e0e0e0"],
                borderWidth: 0
            }]
        },
        options: {
            rotation: -90,
            circumference: 180,
            cutout: "75%",
            plugins: { legend: { display: false } }
        }
    });
    gauges[canvasId] = gauge;
    return gauge;
}

function updateGauge(canvasId, value) {
    const chart = gauges[canvasId];
    if (chart) {
        chart.data.datasets[0].data = [value, 100 - value];
        chart.update();
    }
}

function updateGauges(data) {
    updateGauge('pulseGauge', data.pulse || 0);
    updateGauge('oxygenGauge', data.oxygen || 0);
    updateGauge('smokeLevelGauge', data.smokeLevel || 0);

    document.getElementById('pulseValue').innerText = data.pulse || "0";
    document.getElementById('oxygenValue').innerText = data.oxygen || "0";
    document.getElementById('smokeAlert').innerText = (data.smokeLevel || 0) > 80 ? "Alert! High Smoke" : "No Alert";

    const sosAlert = document.getElementById('sosAlert');
    if (data.sos === 1) {
        sosAlert.style.display = "block";
        sosAlert.innerText = "🚨 EMERGENCY SOS SIGNAL DETECTED!";
    } else {
        sosAlert.style.display = "none";
        sosAlert.innerText = "";
    }
}

// ✅ Update Google Map with live GPS location
function updateMap(lat, lng) {
    const mapURL = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    document.getElementById('mapFrame').src = mapURL;

    document.getElementById('latitude').innerText = lat.toFixed(6);
    document.getElementById('longitude').innerText = lng.toFixed(6);
}

// ✅ Fetch GPS data from ESP32 endpoint
async function fetchGPSData() {
    try {
        const response = await fetch('http://192.168.10.111/gps'); // ✅ replace with your ESP32 IP
        const data = await response.json();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            updateMap(lat, lng);
        }
    } catch (error) {
        console.error('Error fetching GPS data:', error);
    }
}

// ✅ Unified fetch (GPS only for now, expand later for pulse/smoke)
async function fetchData() {
    try {
        await fetchGPSData();
        // Later: also fetch healthData when it's ready from ESP32
        // const response = await fetch('http://192.168.10.111/healthData');
        // const data = await response.json();
        // updateGauges(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// ✅ Initial Gauge Setup (to avoid breaking even if not yet used)
createGauge('pulseGauge', 'Pulse Rate', 0, 'purple');
createGauge('oxygenGauge', 'Oxygen Level', 0, 'blue');
createGauge('smokeLevelGauge', 'Smoke Level', 0, 'orange');

// ✅ Run fetch every 5 seconds
setInterval(fetchData, 5000);
fetchData();

// ✅ Back button
document.getElementById('backButton').onclick = () => {
    window.location.href = "index.html";
};
