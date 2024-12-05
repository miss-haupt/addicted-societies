console.log('painting.js loaded successfully'); // Add this for debugging

let socket;
let yawValue = 0;
let pitchValue = 0;
let rollValue = 0;
let zAccel = 0; // Variable to store z-axis acceleration from aworld
let prevX = window.innerWidth / 2;
let prevY = window.innerHeight / 2;
let smoothing = 0.05;  // Lowered smoothing for quick response

// Calibration offsets
let yawOffset = 0;
let rollOffset = 0;

let startTime;
let fadingOut = false; // Flag to initiate fade-out
let drawingActive = true; // Controls whether we should be drawing or not

// The limits of the physical space in cm where the movement occurs
const physicalYawRange = { min: -20, max: 20 }; // Horizontal range in degrees
const physicalRollRange = { min: -15, max: 15 }; // Vertical range in degrees

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background('#F3F3DE');
    console.log('Canvas created'); // Add this for debugging

    socket = io();
    console.log('Socket connection initialized'); 

    // Fetch Gist data via REST API after page reload
    fetchGistData();

    // Listen for real-time Gist updates
    socket.on('gistData', (data) => {
        console.log('Received updated Gist data:', data);
        visualizeData(data);
    });

    // Initialize the timer
    startTime = millis();

    socket.on('arduinoData', (data) => {
        try {
            if (data && data.yaw !== undefined && data.pitch !== undefined && data.roll !== undefined && data.aworld) {
                yawValue = data.yaw;
                pitchValue = data.pitch;
                rollValue = data.roll;
                zAccel = data.aworld[2];  // Assuming aworld[2] is the z-axis value

                // Apply offsets after calibration
                yawValue -= yawOffset;
                rollValue -= rollOffset;

                // Constrain the values within the adjusted physical range
                yawValue = constrain(yawValue, physicalYawRange.min, physicalYawRange.max);
                rollValue = constrain(rollValue, physicalRollRange.min, physicalRollRange.max);
            } else {
                console.warn('Invalid data received:', data);
            }
        } catch (error) {
            console.error('Error parsing arduinoData:', error);
        }
    });
}

function draw() {
    console.log('Drawing to canvas'); // Add this for debugging

    // Draw a fading effect for cool visual continuity
    fill(243, 243, 222, 0);
    rect(0, 0, width, height);

    // Check if we need to stop drawing based on z-axis (lifted needle simulation)
    if (zAccel > 10000) { // Adjusting the threshold: Higher values may indicate "needle up"
        drawingActive = false;
    } else {
        drawingActive = true;
    }

    // Fade out after 5 minutes
    if (millis() - startTime > 300000) {
        fadingOut = true;
    }

    if (fadingOut) {
        // Gradually fade out the canvas
        fill(243, 243, 222, 15);
        rect(0, 0, width, height);
        return;
    }

    if (drawingActive) {
        // Map the yaw and roll values from the physical area to the entire canvas range
        let mappedX = map(yawValue, physicalYawRange.min, physicalYawRange.max, 0, width);
        let mappedY = map(rollValue, physicalRollRange.min, physicalRollRange.max, 0, height);

        // Apply smoothing for responsiveness
        let smoothedX = smoothing * mappedX + (1 - smoothing) * prevX;
        let smoothedY = smoothing * mappedY + (1 - smoothing) * prevY;

        prevX = smoothedX;
        prevY = smoothedY;

        // Set circle size dynamically with smaller ranges
        let circleSize = map(pitchValue, -45, 45, 5, 10);  // Make it tinier for precise control

        fill(212, 211, 210, 100);  // drawing for MPU60570 values
        noStroke();
        ellipse(smoothedX, smoothedY, circleSize, circleSize);
    }

    if (drawingActive) {
        // Drawing mouse
        let offsetX = random(-10, 10);
        let offsetY = random(-10, 10);

        beginShape();
        fill(0, 0, 0, 100); 
        for (let i = 0; i < 10; i++) {
            let x = mouseX + offsetX * sin(i * 0.5);
            let y = mouseY + offsetY * cos(i * 0.5);
            vertex(x, y);
        }
        endShape(CLOSE);
    }
}

function keyPressed() {
    if (key === '4' || key === '4') {
        console.log('Resetting canvas');
        background('#F3F3DE');
        prevX = window.innerWidth / 2;
        prevY = window.innerHeight / 2;
        startTime = millis();
        fadingOut = false;
        drawingActive = true;
    }

    if (key === 'c' || key === 'C') {
        console.log('Calibrating neutral position');
        // Set current yaw and roll as neutral/offset positions
        yawOffset = yawValue;
        rollOffset = rollValue;
    }
}

async function fetchGistData() {
    try {
        const response = await axios.get('/api/gist-data');
        console.log('Fetched Gist data via API:', response.data);
        visualizeData(response.data);
    } catch (error) {
        console.error('Error fetching Gist data:', error);
    }
}

function visualizeData(data) {
    const container = document.getElementById('data-visualization');
    if (!container) return;
    container.innerHTML = data.map((entry, index) => `<p class="entry">${index + 1}: ${entry.message}</p>`).join('');
}
