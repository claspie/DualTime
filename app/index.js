import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { geolocation } from "geolocation";
import {me as appbit} from "appbit";
import {today} from "user-activity";
import {battery} from "power";
import {HeartRateSensor} from "heart-rate";
import * as messaging from "messaging";

// Update the clock every minute
clock.granularity = "seconds";

// Get values
const stepValue = document.getElementById("stpValue");
const floorValue = document.getElementById("flValue");
const calValue = document.getElementById("calValue");
const btValue = document.getElementById("btValue");
const kmValue = document.getElementById("kmValue");
const cityName = document.getElementById("city");
const countryName = document.getElementById("country");
const weather = document.getElementById("weather");
const loc_btn = document.getElementById("loc_btn");
const tm_btn = document.getElementById("time_btn");

// Get a handle on the <text> element
const myLabel = document.getElementById("myLabel");

function updateStats(){
  stepValue.text = today.adjusted.steps || 0;
  // calValue.text = today.adjusted.calories || 0;
  // btValue.text = Math.floor(battery.chargeLevel) + "%";
  kmValue.text = (today.adjusted.distance/1000).toFixed(1) || 0;
};

// Get Date and day
const dayName = document.getElementById("dayname");
const date = document.getElementById("date");
const month = document.getElementById("month");

function setDay(val){
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  dayName.text = ""+days[val];
};
function setMonth(val){
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  month.text = ""+months[val];
};

//Heart Rate
let lastValueTimestamp = Date.now();
const bpmValue = document.getElementById("bpmValue");
bpmValue.text="---";
let hrm = new HeartRateSensor();
hrm.onreading = function(){
  bpmValue.text = hrm.heartRate;
  lastValueTimestamp = Date.now();
}
hrm.start();

function setWeather(icon) {
  weather.href = "weather/" + icon + ".png";
}

//Request weather data from companion
function fetchWeather() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({
      command: "weather"
    });
  }
}

function processWeatherData(data) {
  console.log("Condition: " + data.meteo);
  cityName.text = data.city.slice(0,3).toUpperCase();
  countryName.text = data.country;
  setWeather(data.meteo);
}

messaging.peerSocket.onopen = function() {
  fetchWeather();
}
messaging.peerSocket.onmessage = function(evt) {
  if(evt.data) {
    processWeatherData(evt.data);
  }
}
messaging.peerSocket.onerror = function(err) {
  console.log("Error: " + err.code + "-" + err.message);
}

setInterval(fetchWeather, 1000*100);
setInterval(updateStats, 1000*5)

loc_btn.onclick = function() {
  fetchWeather();
  console.log("clicked")
}

// Update the <text> element every tick with the current time

clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  

  
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  myLabel.text = `${hours}:${mins}`;
  setDay(today.getDay());
  setMonth(today.getMonth());
  date.text = today.getDate();
}