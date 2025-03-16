'use strict';

document.getElementById("comprobarBtn").addEventListener("click", obtenerUbicacion);

function obtenerUbicacion() {
    if (!navigator.geolocation) {
        mostrarMensaje("Geolocalización no soportada.");
        return;
    }

    navigator.geolocation.getCurrentPosition(consultarClima, () => mostrarMensaje("No se pudo obtener la ubicación."));
}

function consultarClima(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = "5db085b19a9ce3c36d50986e38adb94c";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

    fetch(url)
        .then(response => response.json())
        .then(data => analizarPronostico(data.list))
        .catch(() => mostrarMensaje("Error al obtener datos."));
}

function analizarPronostico(lista) {
    const primerPronostico = lista[0];
    const esDeDia = new Date(primerPronostico.dt * 1000).getHours() >= 6 && new Date(primerPronostico.dt * 1000).getHours() < 18;

    const hayLluvia = lista.slice(0, 8).some(h => h.weather.some(w => w.main === "Rain"));
    cambiarFondo(primerPronostico.weather[0].main, esDeDia);
    mostrarMensaje(hayLluvia ? "Sí, lloverá." : "No, no lloverá.");
}

function cambiarFondo(clima, esDeDia) {
    let fondo = clima === "Rain" ? (esDeDia ? "gif/dia_lluvioso.gif" : "gif/noche_lluviosa.gif") : 
                clima === "Clear" ? (esDeDia ? "gif/dia_soleado.gif" : "gif/noche_estrellada.gif") : 
                "gif/default.gif";
    document.body.style.backgroundImage = `url('${fondo}')`;
}

function mostrarMensaje(mensaje) {
    document.getElementById("resultado").textContent = mensaje;
}


