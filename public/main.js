document.querySelector('#app').innerHTML = `
    <div id="data-visualization"></div>
    <div id="output">
        <p>X: <span id="xVal">0</span></p>
        <p>Y: <span id="yVal">0</span></p>
    </div>
    <canvas></canvas>
    <dialog class="information">
        The website gets data in real-time, accessible worldwide, allowing users to add their stories.
        It is for creating awareness of our need to always optimize ourselves, with a focus on addiction,
        body modification, and individuality.
    </dialog>
`;

const init = () => {
    const socket = io.connect('https://addicted-societies.onrender.com');

    socket.on('connect', () => {
        console.log('Connected to backend socket');
    });
    
    // Listen for serial sensor data updates from the backend
    socket.on('sensorData', (data) => {
        console.log('Received sensor data:', data);
        const [xPart, yPart] = data.split('|');
        const xCoord = xPart.split(':')[1].trim();
        const yCoord = yPart.split(':')[1].trim();

        document.getElementById('xVal').innerText = xCoord;
        document.getElementById('yVal').innerText = yCoord;
    });

    // Listen for data updates from the Gist
    socket.on('dataUpdated', (newData) => {
        console.log('Data has been updated:', newData);
        visualizeData(newData);
    });

    // Visualization function for displaying updated Gist data
    function visualizeData(data) {
        const container = document.getElementById('data-visualization');
        // container.innerHTML = ''; // Clear previous content
        if (Array.isArray(data)) {
            data.forEach((entry, index) => {
                const p = document.createElement('p');
                p.textContent = `Entry ${index + 1}: ${entry.message}`;
                container.appendChild(p);
            });
        } else {
            const p = document.createElement('p');
            p.textContent = `Entry: ${data}`;
            container.appendChild(p);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    init();
});
