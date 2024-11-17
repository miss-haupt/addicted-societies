// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Import path to manage file paths
const app = express();
const PORT = process.env.PORT || 4000;

// Allow CORS for all origins
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the frontend 'dist' folder
app.use(express.static(path.join(__dirname, '../dist'))); // Adjust the path if your frontend build is elsewhere

// Example GET endpoint to test the backend
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working fine!' });
});

// Serve the index.html when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html')); // Ensure the path is correct
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running at https://addicted-societies.onrender.com`);
});
