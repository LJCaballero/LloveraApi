"use strict";
const apiKey = "b6a90639a080a68afdc0101cbec98a4d";
const HOURS_TO_CHECK = 8;
const checkButton = document.getElementById("checkWeather");
const result = document.getElementById("result");
const loader = document.querySelector(".loader");
const weatherMessage = document.getElementById("weatherMessage");

checkButton.addEventListener("click", async () => {
  try {
    result.classList.remove("hidden");
    loader.classList.remove("hidden");
    weatherMessage.textContent = "";

    const coords = await getCurrentPosition();

    const forecast = await getWeatherForecast(
      coords.latitude,
      coords.longitude
    );

    const willRain = checkIfWillRain(forecast);

    displayResult(willRain);
  } catch (error) {
    handleError(error);
  } finally {
    loader.classList.add("hidden");
  }
});

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Tu navegador no soporta geolocalización"));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(new Error("No se pudo obtener tu ubicación"))
    );
  });
}

async function getWeatherForecast(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  return await response.json();
}

function checkIfWillRain(forecast) {
  const nextHours = forecast.list.slice(0, 3);

  return nextHours.some((hour) => {
    const weatherId = hour.weather[0].id;

    return weatherId >= 500 && weatherId < 600;
  });
}

function displayResult(willRain) {
  weatherMessage.textContent = willRain ? "Sí, va a llover" : "No va a llover";
}