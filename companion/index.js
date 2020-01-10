import { geolocation } from "geolocation";
import * as messaging from "messaging";


var API_KEY = "bd3264a1aa592d14e4c72cd202a5f30e";

// Fetch the weather from OpenWeather
function queryOpenWeather() {
  geolocation.getCurrentPosition(locationSuccess, locationError);
  function locationSuccess(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var linkApi = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon="  + long + "&units=metric" + "&APPID=" + API_KEY;
  fetch(linkApi)
  .then(function (response) {
      response.json()
      .then(function(data) {
        // Just need some values
        var weather = {
          temperature: data.main.temp,
          meteo: data.weather[0].main,
          city: data["name"],
          country: data["sys"]["country"], 
        }
        // Send the weather data to the device
        returnWeatherData(weather);
      });
  })
  .catch(function (err) {
    console.log("Error fetching weather: " + err);
  });
 };
 function locationError(error) {
  console.log("Error: " + error.code,
              "Message: " + error.message);
}
}

// Send the weather data to the device
function returnWeatherData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the device
    messaging.peerSocket.send(data);
  } else {
    console.log("Error: Connection is not open");
  }
}

// Listen for messages from the device
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data && evt.data.command == "weather") {
    // The device requested weather data
    queryOpenWeather();
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}


