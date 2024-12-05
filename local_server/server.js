const express = require('express');
const http = require('http');
const { SerialPort, ReadlineParser } = require('serialport');
const { Server } = require('socket.io');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

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

// Environment Variables
const GITHUB_GIST_ID = process.env.GITHUB_GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Serve static files
app.use(express.static('public'));

// Variables to hold the parsed data
let yprData = null;
let aworldData = null;
let counter = 0;

// Fetch Gist JSON Data
async function fetchGistData() {
    try {
        const response = await axios.get(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
            },
        });
        const gistContent = JSON.parse(response.data.files['data.json'].content);
        console.log('Fetched Gist JSON:', gistContent);
        return gistContent;
    } catch (error) {
        console.error('Error fetching Gist JSON:', error.message);
        return [];
    }
}

// WebSocket connections
io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Fetch Gist data on new client connection
    const gistData = await fetchGistData();
    socket.emit('gistData', gistData);

    // Send Arduino data to clients
    parser.on('data', (data) => {
        counter++;
        if (data.startsWith('ypr')) {
            yprData = parseYPR(data);
        } else if (data.startsWith('aworld')) {
            aworldData = parseAworld(data);
        }

        if (yprData && aworldData) {
            const combinedData = { ...yprData, aworld: aworldData };
            if (counter % 10 === 0) {
                console.log(combinedData);
            }
            socket.emit('arduinoData', combinedData);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Parse YPR Data
function parseYPR(data) {
    try {
        data = data.trim();
        if (!data.startsWith('ypr')) throw new Error('Invalid data prefix');
        const parts = data.substring(3).trim().split(/\s+/);
        if (parts.length !== 3) throw new Error('Incomplete YPR data');
        const [yaw, pitch, roll] = parts.map(parseFloat);
        if (parts.some(isNaN)) throw new Error('Invalid numeric values');
        return { yaw, pitch, roll };
    } catch (error) {
        console.error(`Error parsing YPR data: ${data} - ${error.message}`);
        return null;
    }
}

// Parse Aworld Data
function parseAworld(data) {
    try {
        data = data.trim();
        if (!data.startsWith('aworld')) throw new Error('Invalid data prefix');
        const parts = data.substring(6).trim().split(/\s+/);
        if (parts.length !== 3) throw new Error('Incomplete aworld data');
        const [x, y, z] = parts.map(parseFloat);
        if (parts.some(isNaN)) throw new Error('Invalid numeric values');
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
