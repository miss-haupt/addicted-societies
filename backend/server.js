require('dotenv').config();
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const PORT = process.env.PORT || 4000;
const GITHUB_GIST_ID = process.env.GITHUB_GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the frontend folder
app.use(express.static('public'));

// Step 1: Add a new route to serve your `form.html` file
app.get('/form', (req, res) => {
    // Step 2: `__dirname` refers to the current directory where `server.js` is located.
    //         This way, we can send the `form.html` file back to the client.
    res.sendFile(__dirname + '/form.html');
});

// Set up SerialPort to read data from the Arduino (serial device)
const port = new SerialPort('COM4', { baudRate: 115200 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));

// On receiving serial data, emit it via Socket.IO
parser.on('data', (data) => {
  console.log('Data from Arduino:', data);
  io.emit('sensorData', data.trim()); // Emit sensor data to all clients
});

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
