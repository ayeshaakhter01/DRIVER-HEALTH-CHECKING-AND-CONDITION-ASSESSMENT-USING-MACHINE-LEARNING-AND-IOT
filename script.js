// ✅ Store gauges in a global object
const gauges = {};

// ✅ Initialize Gauges with scale up to 150
function createGauge(canvasId, label, value, color) {
    const maxValue = 150;
    var ctx = document.getElementById(canvasId).getContext('2d');
    var gauge = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [label, ''],
            datasets: [{
                data: [value, Math.max(0, maxValue - value)],
                backgroundColor: [color, "#e0e0e0"],
                borderWidth: 0
            }]
        },
        options: {
            rotation: -90,
            circumference: 180,
            cutout: "75%",
            plugins: {
                legend: { display: false }
            }
        }
    });

    gauges[canvasId] = { chart: gauge, max: maxValue };
    return gauge;
}

// ✅ Create initial gauges
createGauge('oxygenLevelGauge', 'Oxygen Level', 2, 'blue');
createGauge('bodyTempGauge', 'Body Temp', 2, 'orange');
createGauge('alcoholLevelGauge', 'Alcohol Level', 2, 'gray');
createGauge('pulseGauge', 'Pulse IR', 2, 'purple');

// ✅ Show Vehicles Button
document.getElementById('showVehiclesBtn').onclick = function () {
    alert('Show real-time vehicle data!');
};

// ✅ Fetch Data from ESP32
async function fetchData() {
    try {
        const response = await fetch('http://192.168.10.140/data'); // Change IP if needed
        const data = await response.json();

        // ✅ Update gauges with new max range
        updateGauge('bodyTempGauge', data.bodyTemp);
        updateGauge('alcoholLevelGauge', data.alcoholLevel);
        updateGauge('pulseGauge', data.pulseRaw / 1000); // If you're using IR scaling
        updateGauge('oxygenLevelGauge', data.spO2 || 0); // optional fallback

        // ✅ Display values and update input fields automatically
        document.getElementById("bodyTemp").innerText = data.bodyTemp + " °C";
        document.getElementById("alcoholLevel").innerText = data.alcoholLevel + " %";
        document.getElementById("pulseRaw").innerText = data.pulseRaw;
        document.getElementById("beatDetected").innerText = data.beatDetected ? "Yes ❤️" : "No";

        // Update the input fields with fetched data
        document.getElementById('oxygenLevelInput').value = data.spO2 || 96;
        document.getElementById('tempInput').value = data.bodyTemp;
        document.getElementById('alcoholLevelInput').value = data.alcoholLevel;
        document.getElementById('pulseRateInput').value = data.pulseRaw / 1000; // If using IR scaling

        // ✅ Warnings
        document.getElementById("tempAlert").innerText = data.bodyTemp > 38 ? "🔥 High Temperature Detected!" : "";
        document.getElementById("alcoholAlert").innerText = data.alcoholLevel > 30 ? "⚠️ High Alcohol Level!" : "";

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// ✅ Update gauge values
function updateGauge(canvasId, value) {
    const gaugeObj = gauges[canvasId];
    if (!gaugeObj) return;

    const max = gaugeObj.max || 100;
    const chart = gaugeObj.chart;
    chart.data.datasets[0].data = [value, Math.max(0, max - value)];
    chart.update();
}

// ✅ Auto fetch every 5 seconds
setInterval(fetchData, 5000);

// ✅ Submit Button Logic
document.getElementById('submitButton').onclick = function () {
    const yearsDriving = document.getElementById('yearsDriving').value;
    const knowDrive = document.getElementById('knowDrive').value;
    const reactionTime = document.getElementById('reactionTime').value;
    const visionIssues = document.getElementById('visionIssues').value;
    const nightBlindness = document.getElementById('nightBlindness').value;

    alert(`Submitted:
    Years of Driving: ${yearsDriving}
    Know how to Drive: ${knowDrive}
    Reaction Time: ${reactionTime} ms
    Vision Issues: ${visionIssues}
    Night Blindness: ${nightBlindness}`);
};

// ✅ Reaction Time Logic
let reactionTestBox = document.getElementById("reactionTestBox");
let reactionText = document.getElementById("reactionText");

let startTime, endTime;
let waiting = false;

reactionTestBox.addEventListener("click", function () {
    if (!waiting) {
        reactionText.innerText = "Wait for green...";
        reactionTestBox.style.backgroundColor = "#e74c3c";
        waiting = true;

        setTimeout(() => {
            reactionTestBox.style.backgroundColor = "#2ecc71";
            reactionText.innerText = "Click!";
            startTime = Date.now();
        }, Math.random() * 2000 + 1000);
    } else {
        if (reactionTestBox.style.backgroundColor === "rgb(46, 204, 113)") {
            endTime = Date.now();
            let reactionTime = endTime - startTime;
            reactionText.innerText = `${reactionTime} ms`;
            reactionTestBox.style.backgroundColor = "#3498db";
            waiting = false;

            let input = document.getElementById("reactionTime");
            if (input) input.value = reactionTime;
        } else {
            reactionText.innerText = "Too Soon! Try again.";
            reactionTestBox.style.backgroundColor = "#3498db";
            waiting = false;
        }
    }
});

// ✅ Color Vision Logic
function checkColorVision() {
    let answers = [
        { input: "input1", correct: "15", info: "This is 15." },
        { input: "input2", correct: "7", info: "This is 7." },
        { input: "input3", correct: "6", info: "This is 6." },
        { input: "input4", correct: "26", info: "This is 26." }
    ];

    let allCorrect = true;

    answers.forEach((ans, index) => {
        const val = document.getElementById(ans.input).value.trim();
        const info = document.getElementById("info" + (index + 1));

        if (val === ans.correct) {
            info.innerText = ans.info;
            info.style.color = "#2c3e50";
        } else {
            info.innerText = `❌ Incorrect. ${ans.info}`;
            info.style.color = "red";
            allCorrect = false;
        }
    });

    document.getElementById("visionIssues").value = allCorrect ? "no" : "yes";
    document.getElementById("nightBlindness").value = allCorrect ? "no" : "yes";
}
