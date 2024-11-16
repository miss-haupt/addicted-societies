(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=a(e);fetch(e.href,t)}})();document.querySelector("#app").innerHTML=`
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
`;const c=()=>{async function r(){try{const e=await(await fetch("https://gist.githubusercontent.com/miss-haupt/948cbe03427d0077721db6ce6899a18f/raw/data.json")).json();n(e)}catch(o){console.error("Error fetching data:",o)}}function n(o){const e=document.getElementById("data-visualization");e.innerHTML="",o.forEach((t,i)=>{const s=document.createElement("p");s.textContent=`Entry ${i+1}: ${t.message}`,e.appendChild(s)})}function a(){r(),setInterval(r,5e3)}window.onload=a};window.addEventListener("DOMContentLoaded",()=>{c()});
