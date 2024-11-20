require('dotenv').config();
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 4000; // Set server port

// Create Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (in case yocd ..u have a frontend in a public directory)
app.use(express.static('public'));

// Set up SerialPort
const port = new SerialPort('COM4', { baudRate: 115200 }); // Make sure the port matches
const parser = port.pipe(new Readline({ delimiter: '\n' }));

// On receiving serial data, emit it via socket.io
parser.on('data', (data) => {
  console.log('Data from Arduino:', data);
  io.emit('sensorData', data.trim());
});

// Start server
server.listen(PORT, () => {
  console.log(`Server listening at https://addicted-societies.onrender.com/`);
});
