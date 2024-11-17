document.querySelector('#app').innerHTML = `
    <div id="data-visualization"></div>
    <canvas></canvas>
    <dialog class="information">
        The website gets data in realtime by user taht can access worldwide and add there addiction.
        It is for creating awareness for our need to always optimize ourself. this topic is set to addiction
        in combination with tattooing it is to make the body as artwork, to highlight, my body, my choice. 
        to reference to permanent consequences out of action and to give a voice to underground and non-elite society cultures
        Inspired by Cronenberg's film "crimes of the future"

        Technically it is build as a webapplication. While the tattomachine is the user interface, in the digital and physical world.
        meanwhile people are creating together data and so for an artwork, also digital and physical, so they can access current events...
    </dialog>
`
const init = () => {
    // Get backend data
    async function getBackendData() {
        try {
            const response = await fetch('http://localhost:4000/api/test');
            const data = await response.json();
            console.log('Response from backend:', data);
        } catch (error) {
            console.error('Error fetching backend data:', error);
        }
    }
    
    // Call this function to check if the backend connection works
    getBackendData();    


    // Fetch Data every 5seconds from gist data.json
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
}

window.addEventListener('DOMContentLoaded', () => {
    init();
});
