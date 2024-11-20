import io from 'socket.io-client';

document.querySelector('#app').innerHTML = `
    <div id="data-visualization"></div>
    <div id="output">
        <p>X: <span id="xVal">0</span></p>
        <p>Y: <span id="yVal">0</span></p>
    </div>
    <canvas></canvas>
    <dialog class="information">
        The website gets data in realtime by user that can access worldwide and add their addiction.
        It is for creating awareness for our need to always optimize ourselves. This topic is set to addiction
        in combination with tattooing as a form of body art, highlighting "my body, my choice" 
        to reference permanent consequences of actions and to give a voice to underground and non-elite society cultures.
        Inspired by Cronenberg's film "Crimes of the Future".

        Technically, it's built as a web application. While the tattoo machine is the user interface in the digital and physical worlds,
        people are creating data and an artwork together, both digitally and physically, connecting to current events...
    </dialog>
`;

const init = () => {
    const socket = io('https://addicted-societies.onrender.com/');

    // Listen for incoming sensor data from the server
    socket.on('sensorData', (data) => {
        console.log('Received sensor data:', data);

        // Extract the x and y values from the string
        const [xPart, yPart] = data.split('|');
        const xCoord = xPart.split(':')[1].trim();
        const yCoord = yPart.split(':')[1].trim();

        // Update HTML to reflect the received x and y values
        document.getElementById('xVal').innerText = xCoord;
        document.getElementById('yVal').innerText = yCoord;
    });

    // Fetch Data every 5 seconds from gist data.json
    async function fetchData() {
        try {
            const response = await fetch('https://gist.githubusercontent.com/miss-haupt/948cbe03427d0077721db6ce6899a18f/raw/data.json');
            const data = await response.json();
            visualizeData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function visualizeData(data) {
        const container = document.getElementById('data-visualization');
        container.innerHTML = ''; // Clear previous content
        data.forEach((entry, index) => {
            const p = document.createElement('p');
            p.textContent = `Entry ${index + 1}: ${entry.message}`;
            container.appendChild(p);
        });
    }

    // Run fetchData every 5 seconds
    function startPolling() {
        fetchData(); // Fetch data initially right away
        setInterval(fetchData, 5000); // Fetch data every 5000 ms (5 seconds)
    }

    window.onload = startPolling;
};

window.addEventListener('DOMContentLoaded', () => {
    init();
});
