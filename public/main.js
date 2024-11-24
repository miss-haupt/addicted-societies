let socket;
let xData = [];
let yData = [];
let angle = 25; // Initial angle for the L-system
let branchLength = 50; // Base branch length

let yawValue = 0;
let pitchValue = 0;
let rollValue = 0;
let prevX = window.innerWidth / 2;
let prevY = window.innerHeight / 2;
let smoothing = 0.2; // Reduced smoothing for quicker reactions

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background(255);
    frameRate(60); // Explicitly set a higher frame rate

    // Initial Fetch of Data from Gist
    fetchInitialData();

    // Set up Socket.IO connection
    socket = io.connect('https://addicted-societies.onrender.com', {
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log('Connected to backend socket');
    });

    socket.on('sensorData', (data) => {
        // Process real-time sensor data
        yawValue = constrain(data.yaw || 0, -180, 180);
        pitchValue = constrain(data.pitch || 0, -90, 90);
        rollValue = constrain(data.roll || 0, -45, 45);
    });

    socket.on('dataUpdated', (newData) => {
        visualizeData(newData);
    });
}

function draw() {
    background(255, 30); // Fading trail effect

    // Map and smooth sensor values
    let mappedX = map(yawValue, -180, 180, 0, width);
    let mappedY = map(pitchValue, -90, 90, 0, height);

    let smoothedX = smoothing * mappedX + (1 - smoothing) * prevX;
    let smoothedY = smoothing * mappedY + (1 - smoothing) * prevY;

    prevX = smoothedX;
    prevY = smoothedY;

    let circleSize = map(rollValue, -45, 45, 10, 100);

    fill(100, 200, 255, 150);
    noStroke();
    ellipse(smoothedX, smoothedY, circleSize, circleSize);
}

async function fetchInitialData() {
    try {
        const response = await fetch('https://gist.githubusercontent.com/miss-haupt/948cbe03427d0077721db6ce6899a18f/raw/data.json');
        const data = await response.json();
        visualizeData(data);
    } catch (error) {
        console.error("Error fetching initial data:", error);
    }
}

function visualizeData(data) {
    const container = document.getElementById('data-visualization');
    container.innerHTML = data.map((entry, index) => `<p>Entry ${index + 1}: ${entry.message}</p>`).join('');
}
