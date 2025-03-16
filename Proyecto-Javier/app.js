'use strict';

document.getElementById("comprobarBtn").addEventListener("click", verificarLluvia);

function verificarLluvia() {
    if (!navigator.geolocation) {
        mostrarResultado("Geolocalización no soportada en este navegador.");
        return;
    }

    navigator.geolocation.getCurrentPosition(obtenerPronostico, () => {
        mostrarResultado("No se pudo obtener la ubicación.");
    });
}

async function obtenerPronostico(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = "5db085b19a9ce3c36d50986e38adb94c";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        analizarPronostico(data.list);
    } catch {
        mostrarResultado("Error al obtener datos meteorológicos.");
    }
}

function analizarPronostico(lista) {
    const pronostico = lista.slice(0, 8);
    const llovera = pronostico.some(hora => hora.weather.some(w => w.main === "Rain"));
    mostrarResultado(llovera ? "Sí, lloverá." : "No, no lloverá.");
}

function mostrarResultado(mensaje) {
    document.getElementById("resultado").textContent = mensaje;
}
