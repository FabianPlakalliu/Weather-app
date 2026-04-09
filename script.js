const apiKey = "2e40db2f09911bea105009e2bff165b6";

let recentCities = [];

const greekMap = {
  "αθήνα": "Athens",
  "θεσσαλονίκη": "Thessaloniki",
  "πάτρα": "Patras",
  "ηράκλειο": "Heraklion",
  "λάρισα": "Larissa",
  "βόλος": "Volos"
};

const cities = [
  "Athens",
  "Thessaloniki",
  "Patras",
  "Heraklion",
  "Larissa",
  "Volos",
  "London",
  "Paris",
  "Berlin",
  "Rome"
];

const cityInput = document.getElementById("cityInput");
const suggestions = document.getElementById("suggestions");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");

cityInput.addEventListener("input", function () {
  const val = this.value.toLowerCase().trim();
  suggestions.innerHTML = "";

  if (!val) return;

  cities
    .filter(city => city.toLowerCase().startsWith(val))
    .slice(0, 5)
    .forEach(city => {
      const div = document.createElement("div");
      div.textContent = city;

      div.onclick = () => {
        cityInput.value = city;
        suggestions.innerHTML = "";
        getWeather();
      };

      suggestions.appendChild(div);
    });
});

cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});

function getDayName(dateString) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  const date = new Date(dateString);
  return days[date.getDay()];
}

async function getWeather() {
  let city = cityInput.value.trim();
  const cityLower = city.toLowerCase();

  if (greekMap[cityLower]) {
    city = greekMap[cityLower];
  }

  loadingMessage.textContent = "Loading...";
  errorMessage.textContent = "";
  suggestions.innerHTML = "";

  if (!city) {
    loadingMessage.textContent = "";
    errorMessage.textContent = "Please enter a city name.";
    return;
  }

  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    const currentData = await currentResponse.json();

    if (currentData.cod !== 200) {
      loadingMessage.textContent = "";
      errorMessage.textContent = "City not found.";
      return;
    }

    document.getElementById("cityName").textContent = currentData.name;
    document.getElementById("temperature").textContent = `${Math.round(currentData.main.temp)}°C`;
    document.getElementById("description").textContent = currentData.weather[0].description;
    document.getElementById("humidity").textContent = `Humidity: ${currentData.main.humidity}%`;
    document.getElementById("wind").textContent = `Wind: ${currentData.wind.speed} km/h`;

    const iconCode = currentData.weather[0].icon;
    const weatherIcon = document.getElementById("weatherIcon");
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = currentData.weather[0].description;

    const savedCity = currentData.name;
    if (!recentCities.includes(savedCity)) {
      recentCities.unshift(savedCity);

      if (recentCities.length > 5) {
        recentCities.pop();
      }

      updateRecent();
    }

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${savedCity}&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastResponse.json();

    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    const dailyForecasts = [];

    forecastData.list.forEach(item => {
      if (item.dt_txt.includes("12:00:00")) {
        dailyForecasts.push(item);
      }
    });

    dailyForecasts.slice(0, 5).forEach(day => {
      const div = document.createElement("div");
      div.className = "day";

      div.innerHTML = `
        <div class="day-name">${getDayName(day.dt_txt)}</div>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
        <div class="day-temp">${Math.round(day.main.temp)}°C</div>
      `;

      forecastContainer.appendChild(div);
    });

    loadingMessage.textContent = "";
  } catch (error) {
    console.error(error);
    loadingMessage.textContent = "";
    errorMessage.textContent = "Something went wrong.";
  }
}

function updateRecent() {
  const container = document.getElementById("recentList");
  container.innerHTML = "";

  recentCities.forEach(city => {
    const span = document.createElement("span");
    span.textContent = city;

    span.onclick = () => {
      cityInput.value = city;
      getWeather();
    };

    container.appendChild(span);
  });
}