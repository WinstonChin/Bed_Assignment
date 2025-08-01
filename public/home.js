// Check login token
const token = localStorage.getItem('token');
if (!token) {
  alert("Please log in first");
  window.location.href = "login.html";
}

// Load shared header
fetch('header.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('header').innerHTML = html;
    attachWeatherEvent(); // attach weather button after header loads
  });

// Live clock
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('clock').textContent = `${dateStr}, ${timeStr}`;
}
setInterval(updateClock, 1000);
updateClock();

// Quote of the Day
fetch('/api/quote')
  .then(res => res.json())
  .then(data => {
    if (!data.quote || !data.author) {
      throw new Error('Invalid quote data');
    }
    document.getElementById('quote-text').textContent = `"${data.quote}"`;
    document.getElementById('quote-author').textContent = `— ${data.author}`;
  })
  .catch(err => {
    document.getElementById('quote-text').textContent = 'Stay positive, your smile is your strength!';
    document.getElementById('quote-author').textContent = '— SeniorCare';
    console.error('Quote fetch error:', err);
  });

// Load today's medications and appointments
async function loadTodayData() {
  const today = new Date().toISOString().split('T')[0];
  const contentDiv = document.getElementById('content');
  try {
    const [medsRes, appsRes] = await Promise.all([
      fetch('/api/meds', { headers: { "Authorization": `Bearer ${token}` } }),
      fetch('/api/appointments', { headers: { "Authorization": `Bearer ${token}` } })
    ]);
    if (!medsRes.ok || !appsRes.ok) throw new Error('API error');
    const meds = await medsRes.json(), apps = await appsRes.json();
    const todayMeds = meds.filter(m => m.datetime && m.datetime.startsWith(today));
    const todayApps = apps.filter(a => a.time && a.time.startsWith(today));
    let html = `<h2>Today's Schedule</h2>`;
    if (todayMeds.length === 0 && todayApps.length === 0) {
      html += `<p>No medications or appointments today! 🎉</p>`;
    }
    if (todayMeds.length) {
      html += `<h3>💊 Medications:</h3><ul>`;
      todayMeds.forEach(m => {
        const time = new Date(m.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        html += `<li>${m.medicine} at ${time}</li>`;
      });
      html += `</ul>`;
    }
    if (todayApps.length) {
      html += `<h3>🏥 Appointments:</h3><ul>`;
      todayApps.forEach(a => {
        const time = new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        html += `<li>${a.clinic} - ${a.purpose} at ${time}</li>`;
      });
      html += `</ul>`;
    }
    contentDiv.innerHTML = html;
  } catch (e) {
    console.error(e);
    contentDiv.innerHTML = `<h2>Error loading today's schedule</h2><p>Please try again later.</p>`;
  }
}
loadTodayData();


// Weather
navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  getWeather(latitude, longitude);
}

function error() {
  document.getElementById("weather").textContent = "Unable to retrieve your location.";
}

function getWeather(lat, lon) {
  const apiKey = '3652b8b54e92c83d871ca9705153b07f';
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
    })
    .catch(error => {
      document.getElementById("weather").textContent = "Error fetching weather data.";
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
    <h3>${city}</h3>
    <p><img src="${iconUrl}" alt="${description}"> ${temperature}°C, ${description}</p>
  `;
}
// Weather Section
async function loadWeatherChecks() {
  try {
    const res = await fetch('/api/weather-checks');
    if (!res.ok) throw new Error('Failed to fetch weather data');
    const weatherChecks = await res.json();
    const weatherDiv = document.getElementById('weather');
    if (!weatherChecks.length) {
      weatherDiv.innerHTML = '<p>No weather data saved yet.</p>';
      return;
    }
    weatherDiv.innerHTML = weatherChecks.map(w =>
      `<div class="weather-card">
        <h3>${w.location}</h3>
        <p>🌡️ ${w.temperature}°C | 💧 ${w.humidity}%</p>
        <p>${w.condition} - ${w.description}</p>
        <small>Checked at: ${w.checked_at ? new Date(w.checked_at).toLocaleString() : ''}</small>
      </div>`
    ).join('');
  } catch (e) {
    document.getElementById('weather').innerHTML = '<p>Error loading weather data.</p>';
  }
}

// Attach weather search logic
function attachWeatherEvent() {
  const checkBtn = document.getElementById("checkBtn");
  const locationInput = document.getElementById("location");
  const resultDiv = document.getElementById("weather-result");

  if (!checkBtn || !locationInput || !resultDiv) {
    console.warn("Weather elements not found on page.");
    return;
  }

  checkBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    const location = locationInput.value.trim();
    if (!location) {
      alert("Please enter a location.");
      return;
    }

    resultDiv.innerHTML = "Loading...";
    resultDiv.style.display = "block";

    const apiKey = "41ae23560069d0493aadc59947482508";
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch weather data.");
      }

      const weather = {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        location: `${data.name}, ${data.sys.country}`,
      };

      resultDiv.innerHTML = `
        <h3>Weather in ${weather.location}</h3>
        <p><strong>Temperature:</strong> ${weather.temperature}°C</p>
        <p><strong>Humidity:</strong> ${weather.humidity}%</p>
        <p><strong>Condition:</strong> ${weather.description}</p>
      `;
    } catch (error) {
      resultDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
  });
}
