import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import axios from 'axios';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

// Reconstruct `__dirname` in an ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Import SerialPort, but we're going to comment out its use for now
// const { SerialPort } = require('serialport');
// const Readline = require('@serialport/parser-readline');

const PORT = process.env.PORT || 4000;
const GITHUB_GIST_ID = process.env.GITHUB_GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const app = express();
const server = http.createServer(app);
const io = new socketIo(server);

app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the root
app.use(express.static(__dirname + '/public'));

// Add Content Security Policy Header Middleware
app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' https://cdn.socket.io; connect-src 'self' https://cdn.socket.io"
    );
    return next();
  });

// Serve the `form.html` page on `/form` route
app.get('/form', (req, res) => {
    res.sendFile(__dirname + '/form.html');
});

// Commented out the SerialPort setup for now
// Set up SerialPort to read data from the Arduino (serial device)
// const port = new SerialPort('COM4', { baudRate: 115200 });
// const parser = port.pipe(new Readline({ delimiter: '\n' }));

// Commented out the event listener for serial data
// On receiving serial data, emit it via Socket.IO
// parser.on('data', (data) => {
//   console.log('Data from Arduino:', data);
//   io.emit('sensorData', data.trim()); // Emit sensor data to all clients
// });

// Simulate data with fake serial data every 2 seconds
setInterval(() => {
    const fakeData = `X: ${Math.random().toFixed(2) * 100}| Y: ${Math.random().toFixed(2) * 100}`;
    console.log('Mock Data:', fakeData);
    io.emit('sensorData', fakeData); // Emit mock sensor data to all clients
}, 2000); // Send mock data every 2 seconds

// Endpoint for updating Gist JSON with new form data
app.post('/update-data', async (req, res) => {
    const newData = req.body.newData; // New data from the request body
    if (!newData) {
        return res.status(400).json({ error: "No data provided" });
    }

    try {
        // Update Gist
        const gistUpdateUrl = `https://api.github.com/gists/${GITHUB_GIST_ID}`;
        const updateResponse = await axios.patch(
            gistUpdateUrl,
            {
                files: {
                    'data.json': {
                        content: JSON.stringify(newData, null, 2),
                    },
                },
            },
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                },
            }
        );

        console.log("Gist updated successfully", updateResponse.data);

        // Emit new data to all clients
        io.emit('dataUpdated', newData);

        return res.sendStatus(200);
    } catch (error) {
        console.error("Error updating Gist:", error.message);
        return res.status(500).json({ error: "Failed to update Gist" });
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`Server listening at https://addicted-societies.onrender.com`);
});
