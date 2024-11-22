document.querySelector('#app').innerHTML = `
    <div id="data-visualization"></div>
    <div id="output">
        <p>X: <span id="xVal">0</span></p>
        <p>Y: <span id="yVal">0</span></p>
    </div>
    <canvas id="canvas-traces"></canvas>
    <dialog class="information">
        The website gets data in real-time, accessible worldwide, allowing users to add their stories.
        It is for creating awareness of our need to always optimize ourselves, with a focus on addiction,
        body modification, and individuality.
    </dialog>
`;

const init = () => {
    // Initial fetch of the Gist data on page load
    async function fetchInitialData() {
        try {
            const response = await fetch('https://gist.githubusercontent.com/miss-haupt/948cbe03427d0077721db6ce6899a18f/raw/data.json');
            const data = await response.json();
            visualizeData(data);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }

    fetchInitialData();

    const socket = io.connect('https://addicted-societies.onrender.com');

    socket.on('connect', () => {
        console.log('Connected to backend socket');
    });
    
    // Listen for serial sensor data updates from the backend
    socket.on('sensorData', (data) => {
        console.log('Received sensor data:', data);
        const [xPart, yPart] = data.split('|');
        const xCoord = xPart.split(':')[1].trim();
        const yCoord = yPart.split(':')[1].trim();

        document.getElementById('xVal').innerText = xCoord;
        document.getElementById('yVal').innerText = yCoord;

        let xData = [-6.65, -3.18, -3.88, -2.47, 3.66, 4.24];  // Replace with your actual X data
        let yData = [0.75, 0.01, 0.28, 0.19, 2.43, 0.60];      // Replace with your actual Y data
        let currentIndex = 0;

        function addData(xCoord, yCoord) {
            // Parse the values to floats, since split() gives strings
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
        
        // Add the new coordinates to the arrays while keeping their length limited to 50
        addData(xCoord, yCoord);

        let canvas = document.getElementById('canvas-traces');
        let ctx = canvas.getContext('2d');

        // Set canvas to full window size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        function draw() {
            if (currentIndex < xData.length) {
              // Map X and Y data to canvas size
              let x = ((xData[currentIndex] + 12) / 22) * canvas.width;  // Map X (-12 to 10) to (0 to canvas.width)
              let y = ((yData[currentIndex] + 3) / 6) * canvas.height;   // Map Y (-3 to 3) to (0 to canvas.height)
          
              if (currentIndex > 0) {
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.stroke();
              }
          
              // Update previous coordinates
              prevX = x;
              prevY = y;
              currentIndex++;
            }
          
            requestAnimationFrame(draw);  // Keep drawing at each frame
          }

        // Initialize the first point
        let prevX = ((xData[0] + 12) / 22) * canvas.width;
        let prevY = ((yData[0] + 3) / 6) * canvas.height;

        // Start drawing
        draw();
    });

    // Listen for data updates from the Gist
    socket.on('dataUpdated', (newData) => {
        console.log('Data has been updated:', newData);
        visualizeData(newData);
    });

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
};

window.addEventListener('DOMContentLoaded', () => {
    init();
});
