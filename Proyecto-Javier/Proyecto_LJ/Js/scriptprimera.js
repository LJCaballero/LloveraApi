'use strict';

/*
Primero, obtenemos el botón con id="comprobarBtn" y le agregamos un evento de clic.
Cuando el usuario haga clic, se ejecutará la función verificarLluvia(). */
document.getElementById("comprobarBtn").addEventListener("click", verificarLluvia);
// Definimos una función asíncrona para poder usar await más adelante, lo que permite manejar promesas de forma más ordenada
async function verificarLluvia() {
    /*Verificamos si el navegador soporta la API de geolocalización.
    Si no la soporta, mostramos un mensaje de error. */
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            /*Llamamos a getCurrentPosition(), que obtiene la ubicación GPS del usuario.
            Esta función recibe una función de éxito (cuando se obtiene la ubicación). */
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            /*Extraemos las coordenadas del usuario (latitud y longitud).
            Estas coordenadas se usarán para consultar el clima de la ubicación exacta del usuario. */
            const apiKey = "5db085b19a9ce3c36d50986e38adb94c";
            /*Aquí guardamos nuestra clave de API de OpenWeatherMap.
            Es necesaria para poder hacer solicitudes a la API y obtener datos del clima. */
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
            /*Construimos la URL de la API para obtener el pronóstico del clima.
            lat y lon: enviamos las coordenadas del usuario.
            appid=${apiKey}: pasamos nuestra clave de API para autenticarnos.
            units=metric: los datos se obtendrán en grados Celsius.
            lang=es: la información se devolverá en español. */

            try {
                const response = await fetch(url);
                /*Usamos fetch(url) para hacer una solicitud HTTP a la API del clima.
                await hace que el código espere hasta recibir la respuesta de la API. */
                const data = await response.json();
                //Convertimos la respuesta en formato JSON para poder analizar los datos.
                const pronostico = data.list.slice(0, 8); // Próximas 8 horas
                /*La API devuelve el pronóstico de 5 días en intervalos de 3 horas.
                Con slice(0, 8), tomamos solo las próximas 8 entradas, es decir, las próximas 8 horas. */
                
                const llovera = pronostico.some(hora => hora.weather.some(w => w.main === "Rain"));
                /*Recorremos la lista de pronósticos buscando si en alguna hora hay lluvia.
                hora.weather.some(w => w.main === "Rain"):
                Busca en la lista de condiciones meteorológicas si alguna tiene "Rain".
                Si encuentra "Rain", devuelve true, lo que significa que sí lloverá.
                some() se detiene en la primera coincidencia, optimizando la búsqueda. */
                document.getElementById("resultado").textContent = llovera ? "Sí, lloverá." : "No, no lloverá.";
                /*Actualizamos el texto en el HTML con el resultado:
                    "Sí, lloverá." si encontramos lluvia en las próximas 8 horas.
                    "No, no lloverá." si no hay pronóstico de lluvia. */
            } catch (error) {
                document.getElementById("resultado").textContent = "Error al obtener datos meteorológicos.";
            }
            //Si ocurre un error (por ejemplo, la API no responde o la clave es incorrecta), mostramos un mensaje de error al usuario.
        }, () => {
            document.getElementById("resultado").textContent = "No se pudo obtener la ubicación.";
        }); //Si el usuario deniega el permiso de ubicación, mostramos un mensaje indicando que no se pudo obtener la posición.
    } else {
        document.getElementById("resultado").textContent = "Geolocalización no soportada en este navegador.";
    }
    //Si el navegador no soporta geolocalización, mostramos un mensaje de advertencia al usuario.
}

