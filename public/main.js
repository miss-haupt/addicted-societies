let socket;
let xData = [];
let yData = [];
let angle = 25; // Initial angle for the L-system
let branchLength = 50; // Base branch length

let yaw = 0;     // Global variable for yaw
let pitch = 0;   // Global variable for pitch
let roll = 0;    // Global variable for roll

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background(255);

    // Initial Fetch of Data from Gist
    fetchInitialData();

    // Set up Socket.IO connection
    socket = io.connect('https://addicted-societies.onrender.com', {
        transports: ['websocket'], // Use WebSocket for faster communication
    });

    // Socket connection confirmation
    socket.on('connect', () => {
        console.log('Connected to backend socket');
    });

    // Listen for real-time sensor data
    socket.on('sensorData', (data) => {
        console.log(`Received Data from Backend: ${JSON.stringify(data)}`);

        yaw = data.yaw || 0;
        pitch = data.pitch || 0;
        roll = data.roll || 0;
        console.log(`Yaw: ${yaw}, Pitch: ${pitch}, Roll: ${roll}`);

        document.getElementById('yawVal').innerText = yaw; // innerHTML = ` ${yaw}`
        document.getElementById('pitchVal').innerText = pitch;
        document.getElementById('rollVal').innerText = roll;

        //addData(pitch, yaw, roll);
    });

    // Listen for data updates from Gist
    socket.on('dataUpdated', (newData) => {
        console.log('Data has been updated:', newData);
        visualizeData(newData);
    });
}

function draw() {
    background(255, 50); // Fading trail effect

    fill(255, 0, 0, 150); // Red circle
    noStroke();
    ellipse(width / 2, height / 2, 50, 50); // Centered red circle for testing

    // Your circle
    let x = map(yaw, -150, 150, 0, width);
    let y = map(pitch, -20, 20, 0, height);
    let circleSize = map(roll, 0, 50, 10, 100);

    fill(100, 200, 255, 150); // Blue circle
    noStroke();
    ellipse(x, y, circleSize, circleSize);

    console.log(`Mapped X: ${x}, Mapped Y: ${y}, Circle Size: ${circleSize}`);
}

function addData(a, b, c) {
    xData.push(a);
    yData.push(b);
    zData.push(c); // Add roll data to a new array

    // Maintain length of 50
    if (xData.length > 50) xData.shift();
    if (yData.length > 50) yData.shift();
    if (zData.length > 50) zData.shift();
}

// Fetch initial Gist data
async function fetchInitialData() {
    try {
        console.log("Attempting to fetch initial data...");
        const response = await fetch('https://gist.githubusercontent.com/miss-haupt/948cbe03427d0077721db6ce6899a18f/raw/data.json');
        const data = await response.json();
        visualizeData(data);
    } catch (error) {
        console.error("Error fetching initial data:", error);
    }
}

// Visualization function for displaying updated Gist data
function visualizeData(data) {
    const container = document.getElementById('data-visualization');
    container.innerHTML = ''; // Clear previous content

    // Loop through each entry in the array and display it
    data.forEach((entry, index) => {
        const p = document.createElement('p');
        p.textContent = `Entry ${index + 1}: ${entry.message}`;
        container.appendChild(p);
    });
}
