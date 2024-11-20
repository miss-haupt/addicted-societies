require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 4000; // Set server port

// Create Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (in case you have a frontend in a public directory)
app.use(express.static('public'));

// Fake data generator to simulate serial data
setInterval(() => {
  const x = (Math.random() * window.innerWidth).toFixed(2); // Fake X value between 0-1024
  const y = (Math.random() * window.innerHeight).toFixed(2); // Fake Y value between 0-768
  const fakeData = `x:${x} | y:${y}`;

  console.log('Sending fake data:', fakeData);
  io.emit('sensorData', fakeData); // Send the data via Socket.IO
}, 2000); // Send data every 2 seconds

// Start server
server.listen(PORT, () => {
  console.log(`Server listening at https://addicted-societies.onrender.com/`);
});
