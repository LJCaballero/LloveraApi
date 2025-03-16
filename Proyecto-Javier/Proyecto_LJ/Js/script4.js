'use strict';

document.getElementById("comprobarBtn").addEventListener("click", verificarLluvia);

async function verificarLluvia() {
    if (!navigator.geolocation) {
        alert("Geolocalización no soportada.");
        return;
    }

    navigator.geolocation.getCurrentPosition(async position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const apiKey = "5db085b19a9ce3c36d50986e38adb94c";
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            mostrarPronostico(data.list);
            cambiarFondo(data.list[0].weather[0].main, esDeDia(data.list[0].dt));
        } catch (error) {
            alert("Error al obtener datos.");
        }
    });
}

function mostrarPronostico(lista) {
    const tabla = document.querySelector("#tablaClima tbody");
    tabla.innerHTML = "";
    
    lista.slice(0, 8).forEach(hora => {
        let fila = `<tr><td>${new Date(hora.dt * 1000).toLocaleTimeString()}</td>
                    <td>${hora.weather[0].description}</td>
                    <td>${hora.main.temp}°C</td></tr>`;
        tabla.innerHTML += fila;
    });
}

function cambiarFondo(clima, esDeDia) {
    let fondo = clima === "Rain" ? (esDeDia ? "dia_lluvioso.gif" : "noche_lluviosa.gif") : 
                clima === "Clear" ? (esDeDia ? "dia_soleado.gif" : "noche_estrellada.gif") : 
                "default.gif";

    console.log("Fondo a usar: " + fondo);  // Verificar si la URL es correcta

    // Aplicar el fondo al body
    document.body.style.backgroundImage = `url('${fondo}')`;

    // Agregar otro console.log para verificar si el estilo se aplicó correctamente
    console.log("Estilo de fondo aplicado:", document.body.style.backgroundImage);
}

function esDeDia(timestamp) {
    const hora = new Date(timestamp * 1000).getHours();
    return hora >= 6 && hora < 18;
}

