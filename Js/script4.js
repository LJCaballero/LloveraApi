'use strict';

document.getElementById("comprobarBtn").addEventListener("click", verificarClima);
document.getElementById("regresarBtn").addEventListener("click", regresar);

let busquedasRecientes = [];

// 🌟 Establecer fondo predeterminado al cargar la página
window.onload = function () {
    document.body.style.backgroundImage = "url('assets/dInicio.gif')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
};

async function verificarClima() {
    let ubicacion = document.getElementById("ubicacion").value.trim();
    let apiKey = "b561a804ec29f4d040853418daaf03eb";
    let url;

    limpiarInformacion();

    if (ubicacion) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${ubicacion}&appid=${apiKey}&units=metric&lang=es`;
    } else {
        if (!navigator.geolocation) {
            alert("Geolocalización no soportada.");
            return;
        }
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
            await obtenerDatos(url);
        });
        return;
    }
    await obtenerDatos(url);
}

async function obtenerDatos(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (data.cod !== "200") {
            alert("Ubicación no encontrada. Intenta otra ciudad.");
            return;
        }

        mostrarPronostico(data.list);
        mostrarPronosticoLargoPlazo(data.list); // 🔥 Corregido: Se agregó esta función

        // 🔥 Llamar a la función de recomendaciones de ropa
        recomendacionesRopa(data.list[0].main.temp);

        // 🔥 Llamar a la función de cambio de fondo
        cambiarFondo(data.list[0].weather[0].main, data.list[0].main.temp);

        // Guardar búsqueda en el historial de las últimas 5 búsquedas
        if (busquedasRecientes.length >= 5) {
            busquedasRecientes.pop(); // Eliminar el más antiguo si hay más de 5 búsquedas
        }
        busquedasRecientes.unshift(data.city.name); // Agregar la nueva búsqueda al principio

        mostrarBusquedaReciente();

        if (data.city && data.city.country) {
            document.getElementById("ubicacionActual").textContent = `${data.city.name}, ${data.city.country}`;
        }

    } catch (error) {
        console.error("Error al obtener los datos: ", error);
        alert("Error al obtener datos. Revisa tu conexión.");
    }
}

// ✅ Función para cambiar el fondo dinámicamente según el clima y la temperatura
function cambiarFondo(clima, temp) {
    let fondo = "";

    // Si la temperatura es alta, priorizar el fondo de playa
    if (temp >= 30) {
        fondo = "assets/diaPlaya.gif"; // GIF de día de playa para calor extremo
    } else if (clima === "Snow" || temp < 0) {
        fondo = "assets/nieve.gif"; // GIF de nieve para frío extremo
    } else {
        switch (clima) {
            case "Rain":
                fondo = "assets/diaLluvioso.gif";
                break;
            case "Clear":
                fondo = "assets/diaSoleado.gif";
                break;
            case "Clouds":
                fondo = "assets/nublado.gif";
                break;
            default:
                fondo = "assets/dInicio.gif"; // Fondo predeterminado
                break;
        }
    }

    if (fondo) {
        document.body.style.backgroundImage = `url('${fondo}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
    }
}

function mostrarPronostico(lista) {
    const tabla = document.querySelector("#tablaClima tbody");
    tabla.innerHTML = "";

    lista.slice(0, 8).forEach(hora => {
        let icono = `https://openweathermap.org/img/wn/${hora.weather[0].icon}.png`;
        let fila = `
            <tr>
                <td>${new Date(hora.dt * 1000).toLocaleTimeString()}</td>
                <td><img src="${icono}" alt="${hora.weather[0].description}"> ${hora.weather[0].description}</td>
                <td>${hora.main.temp}°C</td>
                <td>${hora.main.feels_like}°C</td>
                <td>${hora.main.humidity}%</td>
                <td>${hora.wind.speed} m/s</td>
            </tr>`;
        tabla.innerHTML += fila;
    });
}

// ✅ Se agregó la función que faltaba para mostrar el pronóstico a largo plazo
function mostrarPronosticoLargoPlazo(lista) {
    const tablaLargoPlazo = document.querySelector("#tablaPronosticoLargoPlazo tbody");
    tablaLargoPlazo.innerHTML = "";
    const diasDisponibles = Math.min(7, Math.floor(lista.length / 8));

    for (let i = 0; i < diasDisponibles; i++) {
        let dia = lista[i * 8];
        if (!dia) continue;

        let fecha = new Date(dia.dt * 1000).toLocaleDateString();
        let icono = `https://openweathermap.org/img/wn/${dia.weather[0].icon}.png`;

        let fila = `
            <tr>
                <td>${fecha}</td>
                <td><img src="${icono}" alt="${dia.weather[0].description}"> ${dia.weather[0].description}</td>
                <td>${dia.main.temp_max}°C</td>
                <td>${dia.main.temp_min}°C</td>
            </tr>`;
        tablaLargoPlazo.innerHTML += fila;
    }
}

// Mostrar las últimas 5 búsquedas
function mostrarBusquedaReciente() {
    const listaBusqueda = document.getElementById("listaBusqueda");
    listaBusqueda.innerHTML = "";

    busquedasRecientes.forEach(busqueda => {
        let li = document.createElement("li");
        li.textContent = busqueda;
        listaBusqueda.appendChild(li);
    });
}

// 🔥 Función de recomendaciones de ropa según la temperatura
function recomendacionesRopa(temp) {
    let mensaje = "";

    if (temp >= 30) {
        mensaje = "Hace mucho calor 🌞. Usa ropa ligera, gafas de sol y mantente hidratado.";
    } else if (temp >= 20) {
        mensaje = "Clima templado ☀️. Puedes usar ropa cómoda como una camiseta y jeans.";
    } else if (temp >= 10) {
        mensaje = "Hace un poco de frío 🍂. Se recomienda usar una chaqueta ligera.";
    } else if (temp >= 0) {
        mensaje = "Hace frío ❄️. Usa abrigo, bufanda y guantes.";
    } else {
        mensaje = "Mucho frío 🥶. Necesitas abrigo grueso, gorro y guantes.";
    }

    document.getElementById("ropaRecomendada").textContent = mensaje;
}

// 🔥 Función para limpiar la información de la tabla y ubicación
function limpiarInformacion() {
    document.querySelector("#tablaClima tbody").innerHTML = "";
    document.querySelector("#tablaPronosticoLargoPlazo tbody").innerHTML = "";
    document.getElementById("ubicacionActual").textContent = "Ubicación Actual: --";
    document.getElementById("ropaRecomendada").textContent = "Por favor, ingresa una ubicación para ver las recomendaciones de ropa.";
}

function regresar() {
    limpiarInformacion();
    document.getElementById("ubicacion").value = "";
}
