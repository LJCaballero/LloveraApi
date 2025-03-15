'use strict';

const apiKey = '995eb064366271607c77c3c82ba97cb8';

document.getElementById('consultarClima').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude: lat, longitude: lon } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

      const contenedorClima = document.getElementById('contenedorClima');
      contenedorClima.innerHTML = ''; 

      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Error en la solicitud: ' + response.statusText);
          return response.json();
        })
        .then(data => {
          contenedorClima.classList.add('contenedorClima'); 
          const elementos = [
            `Temperatura actual: ${(data.list[0].main.temp - 273.15).toFixed(2)}°C`,
            `Humedad actual: ${data.list[0].main.humidity}%`,
            `Velocidad del viento actual: ${data.list[0].wind.speed} m/s`,
            data.list.slice(0, 8).some(hora => hora.weather.some(w => w.main === ('Rain'))) ? 'Lloverá en las próximas 8 horas: Sí' : 'Lloverá en las próximas 8 horas: No'
          ];
          elementos.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            contenedorClima.appendChild(p);
          });
        })
        .catch(error => {
          console.error('Error al consultar los datos:', error);
          contenedorClima.innerHTML = 'Error al consultar los datos del clima.';
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