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
    socket = io.connect('https://addicted-societies.onrender.com');

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

        document.getElementById('yawVal').innerText = yaw;
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

    // Adjust mapping ranges based on your data
    let x = map(yaw, -110, 110, 0, width);  // Adjusted for your yaw values
    let y = map(pitch, -20, 20, 0, height); // Adjusted for your pitch values
    let circleSize = map(roll, 0, 50, 10, 100); // Adjusted for your roll values

    fill(100, 200, 255, 150);
    noStroke();
    ellipse(x, y, circleSize, circleSize); // Draw a circle based on YPR data
}

function addData(yaw, pitch, roll) {
    xData.push(yaw);
    yData.push(pitch);
    zData.push(roll); // Add roll data to a new array

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
