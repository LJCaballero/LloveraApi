"use strict";

document
  .getElementById("comprobarBtn")
  .addEventListener("click", verificarClima);
document.getElementById("regresarBtn").addEventListener("click", regresar);


let busquedasRecientes =
  JSON.parse(localStorage.getItem("busquedasRecientes")) || [];
let ciudadesFavoritas =
  JSON.parse(localStorage.getItem("ciudadesFavoritas")) || [];


window.onload = function () {
  document.body.style.backgroundImage = "url('assets/dInicio.gif')";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";

  
  mostrarBusquedaReciente();
  mostrarCiudadesFavoritas();
};

function guardarEnLocalStorage() {
  localStorage.setItem(
    "busquedasRecientes",
    JSON.stringify(busquedasRecientes)
  );
  localStorage.setItem("ciudadesFavoritas", JSON.stringify(ciudadesFavoritas));
}

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
    navigator.geolocation.getCurrentPosition(async (position) => {
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
    mostrarPronosticoLargoPlazo(data.list);
    recomendacionesRopa(data.list[0].main.temp);
    cambiarFondo(data.list[0].weather[0].main, data.list[0].main.temp);

    if (data.city && data.city.name) {
      if (busquedasRecientes.length >= 5) {
        busquedasRecientes.pop();
      }
      if (!busquedasRecientes.includes(data.city.name)) {
        busquedasRecientes.unshift(data.city.name);
        guardarEnLocalStorage();
        mostrarBusquedaReciente();
      }
    }

    if (data.city && data.city.country) {
      const ubicacionActual = document.getElementById("ubicacionActual");
      ubicacionActual.innerHTML = `${data.city.name}, ${data.city.country}`;

      const botonFavorito = document.createElement("button");
      botonFavorito.className = "favorite-btn";
      botonFavorito.textContent = ciudadesFavoritas.includes(data.city.name)
        ? "★ Favorito"
        : "☆ Agregar a Favoritos";
      botonFavorito.onclick = () => toggleFavorito(data.city.name);
      ubicacionActual.appendChild(botonFavorito);
    }
  } catch (error) {
    console.error("Error al obtener los datos: ", error);
    alert("Error al obtener datos. Revisa tu conexión.");
  }
}

function toggleFavorito(ciudad) {
  const index = ciudadesFavoritas.indexOf(ciudad);
  if (index === -1) {
    ciudadesFavoritas.push(ciudad);
  } else {
    ciudadesFavoritas.splice(index, 1);
  }
  guardarEnLocalStorage();
  mostrarCiudadesFavoritas();

  const botonFavorito = document.querySelector(".favorite-btn");
  if (botonFavorito) {
    botonFavorito.textContent = ciudadesFavoritas.includes(ciudad)
      ? "★ Favorito"
      : "☆ Agregar a Favoritos";
  }
}

function mostrarBusquedaReciente() {
  const listaBusqueda = document.getElementById("listaBusqueda");
  listaBusqueda.innerHTML = "";

  busquedasRecientes.forEach((busqueda) => {
    let li = document.createElement("li");
    li.innerHTML = `
            <span>${busqueda}</span>
            <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorito('${busqueda}')">
                ${ciudadesFavoritas.includes(busqueda) ? "★" : "☆"}
            </button>
        `;

    li.onclick = () => {
      document.getElementById("ubicacion").value = busqueda;
      verificarClima();
    };

    listaBusqueda.appendChild(li);
  });
}

function mostrarCiudadesFavoritas() {
  const listaFavoritas = document.getElementById("listaFavoritos");
  listaFavoritas.innerHTML = "";

  ciudadesFavoritas.forEach((ciudad) => {
    let li = document.createElement("li");
    li.innerHTML = `
            <span>${ciudad}</span>
            <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorito('${ciudad}')">★</button>
        `;

    li.onclick = () => {
      document.getElementById("ubicacion").value = ciudad;
      verificarClima();
    };

    listaFavoritas.appendChild(li);
  });
}


function cambiarFondo(clima, temp) {
  let fondo = "";

  if (temp >= 30) {
    fondo = "assets/diaPlaya.gif"; 
  } else if (clima === "Snow" || temp < 0) {
    fondo = "assets/nieve.gif"; 
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
        fondo = "assets/dInicio.gif"; 
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

  lista.slice(0, 8).forEach((hora) => {
    let icono = `https://openweathermap.org/img/wn/${hora.weather[0].icon}.png`;
    let fila = `
            <tr>
                <td>${new Date(hora.dt * 1000).toLocaleTimeString()}</td>
                <td><img src="${icono}" alt="${hora.weather[0].description}"> ${
      hora.weather[0].description
    }</td>
                <td>${hora.main.temp}°C</td>
                <td>${hora.main.feels_like}°C</td>
                <td>${hora.main.humidity}%</td>
                <td>${hora.wind.speed} m/s</td>
            </tr>`;
    tabla.innerHTML += fila;
  });
}


function mostrarPronosticoLargoPlazo(lista) {
  const tablaLargoPlazo = document.querySelector(
    "#tablaPronosticoLargoPlazo tbody"
  );
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

function recomendacionesRopa(temp) {
  let mensaje = "";

  if (temp >= 30) {
    mensaje =
      "Hace mucho calor 🌞. Usa ropa ligera, gafas de sol y mantente hidratado.";
  } else if (temp >= 20) {
    mensaje =
      "Clima templado ☀️. Puedes usar ropa cómoda como una camiseta y jeans.";
  } else if (temp >= 10) {
    mensaje =
      "Hace un poco de frío 🍂. Se recomienda usar una chaqueta ligera.";
  } else if (temp >= 0) {
    mensaje = "Hace frío ❄️. Usa abrigo, bufanda y guantes.";
  } else {
    mensaje = "Mucho frío 🥶. Necesitas abrigo grueso, gorro y guantes.";
  }

  document.getElementById("ropaRecomendada").textContent = mensaje;
}

function limpiarInformacion() {
  document.querySelector("#tablaClima tbody").innerHTML = "";
  document.querySelector("#tablaPronosticoLargoPlazo tbody").innerHTML = "";
  document.getElementById("ubicacionActual").textContent =
    "Ubicación Actual: --";
  document.getElementById("ropaRecomendada").textContent =
    "Por favor, ingresa una ubicación para ver las recomendaciones de ropa.";
}

function regresar() {
  limpiarInformacion();
  document.getElementById("ubicacion").value = "";
}
