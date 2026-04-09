const apiKey = "2e40db2f09911bea105009e2bff165b6";

let recentCities = [];

// Greek to English
const greekMap = {
  "αθήνα": "Athens",
  "θεσσαλονίκη": "Thessaloniki"
};

// suggestions
const cities = ["Athens","Thessaloniki","London","Paris","Berlin","Rome"];

document.getElementById("cityInput").addEventListener("input", function(){
  const val = this.value.toLowerCase();
  const sug = document.getElementById("suggestions");
  sug.innerHTML = "";

  if(!val) return;

  cities
    .filter(c => c.toLowerCase().startsWith(val))
    .forEach(c=>{
      const div = document.createElement("div");
      div.textContent = c;

      div.onclick = ()=>{
        document.getElementById("cityInput").value = c;
        sug.innerHTML="";
        getWeather();
      };

      sug.appendChild(div);
    });
});

// enter key
document.getElementById("cityInput").addEventListener("keypress", e=>{
  if(e.key==="Enter") getWeather();
});

async function getWeather(){

  let city = document.getElementById("cityInput").value.trim().toLowerCase();

  // Greek support
  if(greekMap[city]) city = greekMap[city];

  document.getElementById("loadingMessage").textContent="Loading...";
  document.getElementById("errorMessage").textContent="";

  try{

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    const data = await res.json();

    if(data.cod !== 200){
      document.getElementById("errorMessage").textContent="City not found";
      return;
    }

    // main info
    document.getElementById("cityName").textContent=data.name;
    document.getElementById("temperature").textContent=data.main.temp+"°C";
    document.getElementById("description").textContent=data.weather[0].description;
    document.getElementById("humidity").textContent="Humidity: "+data.main.humidity+"%";
    document.getElementById("wind").textContent="Wind: "+data.wind.speed+" km/h";

    const icon=data.weather[0].icon;
    document.getElementById("weatherIcon").src=
      `https://openweathermap.org/img/wn/${icon}@2x.png`;

    // recent
    if(!recentCities.includes(city)){
      recentCities.unshift(city);
      if(recentCities.length>5) recentCities.pop();
      updateRecent();
    }

    // forecast
    const res2 = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );

    const forecastData = await res2.json();

    const container = document.getElementById("forecast");
    container.innerHTML="";

    forecastData.list.slice(0,7).forEach(day=>{
      const div = document.createElement("div");
      div.className="day";

      div.innerHTML=`
        <p>${day.main.temp}°C</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
      `;

      container.appendChild(div);
    });

  }catch(err){
    document.getElementById("errorMessage").textContent="Error loading data";
  }

  document.getElementById("loadingMessage").textContent="";
}

// recent UI
function updateRecent(){
  const container=document.getElementById("recentList");
  container.innerHTML="";

  recentCities.forEach(c=>{
    const span=document.createElement("span");
    span.textContent=c;

    span.onclick=()=>{
      document.getElementById("cityInput").value=c;
      getWeather();
    };

    container.appendChild(span);
  });
}