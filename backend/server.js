const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const PORT = 3000;

// Set up Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve your webpage (assuming you have a 'public' folder with HTML)
app.use(express.static(__dirname + '/public'));

// Set up SerialPort
const port = new SerialPort('COM4', { baudRate: 115200 }); // Update 'COM4' with the correct port name for your Arduino
const parser = port.pipe(new Readline({ delimiter: '\n' }));

// When serial data arrives, emit it to WebSocket
parser.on('data', (data) => {
    console.log('Data from Arduino:', data);
    io.emit('sensorData', data); // Send the data to the connected clients
});

// Start server
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

