const token = localStorage.getItem('token');
if (!token) {
  alert("Please log in first");
  window.location.href = "login.html";
}

navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  getWeather(latitude, longitude);
}

function error() {
  alert("Unable to retrieve your location.");
}

function getWeather(lat, lon) {
  const apiKey = '3652b8b54e92c83d871ca9705153b07f'
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
    })
    .catch(error => {
      console.error("Error fetching weather data:", error);
    });
}
function displayWeather(data) {
  const weatherDiv = document.getElementById("weather");

  const city = data.name;
  const temperature = data.main.temp;
  const description = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherDiv.innerHTML = `
    <h2>Weather in ${city}</h2>
    <p><img src="${iconUrl}" alt="${description}"> ${temperature}°C, ${description}</p>
  `;
}