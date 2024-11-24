let socket;
let xData = [];
let yData = [];
let angle = 25; // Initial angle for the L-system
let branchLength = 50; // Base branch length

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
        yaw = data.yaw;
        pitch = data.pitch;
        roll = data.roll;
        console.log(`Yaw: ${yaw}, Pitch: ${pitch}, Roll: ${roll}`);

        document.getElementById('yawVal').innerText = yaw;
        document.getElementById('pitchVal').innerText = pitch;
        document.getElementById('rollVall').innerText = roll;

        addData(pitch, yaw, roll);
    });

    // Listen for data updates from Gist
    socket.on('dataUpdated', (newData) => {
        console.log('Data has been updated:', newData);
        visualizeData(newData);
    });
}

function draw() {
    background(255, 50); // Fading trail effect

    // Map yaw, pitch, roll to screen coordinates and size
    let x = map(yaw, -180, 180, 0, width);
    let y = map(pitch, -90, 90, 0, height);
    let size = map(roll, -45, 45, 10, 50);

    fill(100, 200, 255, 150);
    noStroke();
    ellipse(x, y, size, size); // Draw a circle based on YPR data
}

function addData(yaw, pitch, roll) {
    // Parse the values to floats
    let aValue = parseFloat(yaw);
    let bValue = parseFloat(pitch);
    let cValue = parseFloat(roll);

    // Add new data to the arrays
    aData.push(aValue);
    bData.push(bValue);
    cData.push(cValue);

    // Maintain length of 50 by removing the oldest value if array length exceeds 50
    if (aData.length > 50) {
        aData.shift(); // Remove the first element of xData
    }
    if (bData.length > 50) {
        bData.shift(); // Remove the first element of yData
    }
    if (cData.length > 50) {
        cData.shift(); // Remove the first element of yData
    }
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
