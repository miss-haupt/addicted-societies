let socket;
let xData = [];
let yData = [];

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
    console.log('Received sensor data:', data);
    const [xPart, yPart] = data.split('|');
    const xCoord = xPart.split(':')[1].trim();
    const yCoord = yPart.split(':')[1].trim();

    document.getElementById('xVal').innerText = xCoord;
    document.getElementById('yVal').innerText = yCoord;

    addData(xCoord, yCoord);
    });

    // Listen for data updates from Gist
    socket.on('dataUpdated', (newData) => {
    console.log('Data has been updated:', newData);
    visualizeData(newData);
    });
}

function draw() {
    background(255, 50);  // Create a fade effect to visualize movement over time

    // Draw the data points as a smooth line
    if (xData.length > 1) {
    for (let i = 1; i < xData.length; i++) {
        let x1 = map(xData[i - 1], -12, 10, 0, width);
        let y1 = map(yData[i - 1], -3, 3, 0, height);
        let x2 = map(xData[i], -12, 10, 0, width);
        let y2 = map(yData[i], -3, 3, 0, height);

        stroke(0);
        strokeWeight(2);
        line(x1, y1, x2, y2);
    }
    }
}

function addData(xCoord, yCoord) {
    // Parse the values to floats
    let xValue = parseFloat(xCoord);
    let yValue = parseFloat(yCoord);

    // Add new data to the arrays
    xData.push(xValue);
    yData.push(yValue);

    // Maintain length of 50 by removing the oldest value if array length exceeds 50
    if (xData.length > 50) {
    xData.shift(); // Remove the first element of xData
    }
    if (yData.length > 50) {
    yData.shift(); // Remove the first element of yData
    }
}

// Fetch initial Gist data
async function fetchInitialData() {
    try {
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
