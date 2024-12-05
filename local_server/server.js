const express = require('express');
const http = require('http');
const { SerialPort, ReadlineParser } = require('serialport');
const { Server } = require('socket.io');

const app = express();
app.use(require('cors')());
const server = http.createServer(app);
const io = new Server(server);

// Serial Configuration
const serialPort = new SerialPort({
    path: 'COM6', // Change this to your Arduino's COM port
    baudRate: 115200,
});
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// Serve static files
app.use(express.static('public'));

// Variables to hold the parsed data
let yprData = null;
let aworldData = null;
let counter = 0;

// WebSocket connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send Arduino data to clients
    parser.on('data', (data) => {
        counter++; 
        // Log the raw data to debug
        // console.log('Raw data from Arduino:', data.trim());

        // Try to parse both YPR and aworld data
        if (data.startsWith('ypr')) {
            yprData = parseYPR(data);
        } else if (data.startsWith('aworld')) {
            aworldData = parseAworld(data);
        }

        // If we have valid data for both ypr and aworld, send them together
        if (yprData && aworldData) {
            const combinedData = { ...yprData, aworld: aworldData };
            if (counter % 10 == 0) {
                console.log(combinedData);
            }
            socket.emit('arduinoData', combinedData);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

function parseYPR(data) {
    try {
        // Trim whitespace
        data = data.trim();

        // Check if the data starts with "ypr"
        if (!data.startsWith("ypr")) {
            throw new Error("Invalid data prefix");
        }

        // Remove the "ypr" prefix and split the values
        const cleanData = data.substring(3).trim(); // Remove "ypr" and extra spaces
        const parts = cleanData.split(/\s+/); // Split by one or more spaces

        // Ensure there are exactly 3 parts
        if (parts.length !== 3) {
            throw new Error("Incomplete YPR data");
        }

        // Convert parts to numbers
        const yaw = parseFloat(parts[0]);
        const pitch = parseFloat(parts[1]);
        const roll = parseFloat(parts[2]);

        // Validate the numbers
        if (isNaN(yaw) || isNaN(pitch) || isNaN(roll)) {
            throw new Error("Invalid numeric values");
        }

        // Return the parsed data
        return { yaw, pitch, roll };
    } catch (error) {
        console.error(`Error parsing YPR data: ${data} - ${error.message}`);
        return null;
    }
}

function parseAworld(data) {
    try {
        // Trim whitespace
        data = data.trim();

        // Check if the data starts with "aworld"
        if (!data.startsWith("aworld")) {
            throw new Error("Invalid data prefix");
        }

        // Remove the "aworld" prefix and split the values
        const cleanData = data.substring(6).trim(); // Remove "aworld" and extra spaces
        const parts = cleanData.split(/\s+/); // Split by one or more spaces

        // Ensure there are exactly 3 parts (x, y, z values)
        if (parts.length !== 3) {
            throw new Error("Incomplete aworld data");
        }

        // Convert parts to numbers
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);

        // Validate the numbers
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            throw new Error("Invalid numeric values");
        }

        // Return the parsed data
        return [x, y, z];
    } catch (error) {
        console.error(`Error parsing aworld data: ${data} - ${error.message}`);
        return null;
    }
}

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`WebSocket server running at http://localhost:${PORT}`);
});
