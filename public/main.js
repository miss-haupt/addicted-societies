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
    background(255, 50); // Fading background for movement effect

    translate(width / 2, height); // Start drawing from bottom center
    stroke(0);
    strokeWeight(2);

    // Draw the L-System branches
    if (xData.length > 1) {
        for (let i = 0; i < xData.length; i++) {
            let mappedAngle = map(xData[i], -12, 10, -45, 45); // Map x data to angles
            let mappedLength = map(yData[i], -3, 3, 20, 100); // Map y data to branch lengths
            angle = mappedAngle;
            branchLength = mappedLength;

            drawBranch(branchLength);
        }
    }
}

function drawBranch(len) {
    if (len < 10) {
        return; // Stop recursion for small branches
    }

    // Draw the main branch
    line(0, 0, 0, -len);
    translate(0, -len);

    // Save the current drawing state
    push();
    rotate(radians(angle));
    drawBranch(len * 0.7); // Draw the right branch
    pop();

    push();
    rotate(radians(-angle));
    drawBranch(len * 0.7); // Draw the left branch
    pop();
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
