// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

// Allow CORS for all origins
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Example GET endpoint to test the backend
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working fine!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
