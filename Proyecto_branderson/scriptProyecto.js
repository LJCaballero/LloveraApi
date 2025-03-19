'use strict';

const apiKey = '995eb064366271607c77c3c82ba97cb8';

// Consulta por coordenadas (geolocalización)
document.getElementById('consultarClima').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude: lat, longitude: lon } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Error en la solicitud: ' + response.statusText);
          return response.json();
        })
        .then(data => {
          // Actualizamos solo el contenido de los elementos existentes
          document.getElementById('temperatura').textContent = `Temperatura actual: ${(data.list[0].main.temp - 273.15).toFixed(2)}°C`;
          document.getElementById('humedad').textContent = `Humedad actual: ${data.list[0].main.humidity}%`;
          document.getElementById('viento').textContent = `Velocidad del viento actual: ${data.list[0].wind.speed} m/s`;
          document.getElementById('LLovera?').textContent = data.list.slice(0, 8).some(hora => hora.weather.some(w => w.main === 'Rain')) 
            ? 'Lloverá en las próximas 8 horas: Sí' 
            : 'Lloverá en las próximas 8 horas: No';
        })
        .catch(error => {
          console.error('Error al consultar los datos:', error);
          document.getElementById('contenedorClima').innerHTML = 'Error al consultar los datos del clima.';
        });
    }, error => {
      console.error('Error al obtener las coordenadas:', error);
      document.getElementById('contenedorClima').innerHTML = 'Error al obtener las coordenadas.';
    });
  } else {
    console.error('Geolocalización no es soportada por este navegador.');
    document.getElementById('contenedorClima').innerHTML = 'Geolocalización no es soportada por este navegador.';
  }
});


document.getElementById('consultarCiudad').addEventListener('click', () => {
  const ciudad = document.getElementById('buscador').value.trim();
  if (!ciudad) {
    alert('Por favor, ingrese una ciudad.');
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${apiKey}`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Error en la solicitud: ' + response.statusText);
      return response.json();
    })
    .then(data => {
     
      document.getElementById('temperatura').textContent = `Temperatura actual: ${(data.list[0].main.temp - 273.15).toFixed(2)}°C`;
      document.getElementById('humedad').textContent = `Humedad actual: ${data.list[0].main.humidity}%`;
      document.getElementById('viento').textContent = `Velocidad del viento actual: ${data.list[0].wind.speed} m/s`;
      document.getElementById('LLovera?').textContent = data.list.slice(0, 8).some(hora => hora.weather.some(w => w.main === 'Rain')) 
        ? 'Lloverá en las próximas 8 horas: Sí' 
        : 'Lloverá en las próximas 8 horas: No';
    })
    .catch(error => {
      console.error('Error al consultar los datos:', error);
      document.getElementById('contenedorClima').innerHTML = 'Error al consultar los datos del clima.';
    });
});