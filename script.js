document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // Default location: Apple Park, Cupertino
    const latitude = 37.3349;
    const longitude = -122.0091;
    const city = "Cupertino";

    // --- API URL ---
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=10`;

    // --- DOM Elements ---
    const cityName = document.getElementById('city-name');
    const currentTemp = document.getElementById('current-temp');
    const weatherDescription = document.getElementById('weather-description');
    const highTemp = document.getElementById('high-temp');
    const lowTemp = document.getElementById('low-temp');
    const hourlyForecast = document.getElementById('hourly-forecast');
    const dailyForecast = document.getElementById('daily-forecast');
    const uvIndex = document.getElementById('uv-index');
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    const windSpeed = document.getElementById('wind-speed');
    const precipitation = document.getElementById('precipitation');
    const airQuality = document.getElementById('air-quality'); // Note: Open-Meteo free tier doesn't have AQI, so this is static.

    // --- Fetch and Display Weather Data ---
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data); // For debugging
            displayCurrentWeather(data);
            displayHourlyForecast(data);
            displayDailyForecast(data);
            displayWeatherDetails(data);
        })
        .catch(error => console.error('Error fetching weather data:', error));

    function displayCurrentWeather(data) {
        cityName.textContent = city;
        currentTemp.textContent = `${Math.round(data.current.temperature_2m)}°`;
        const currentWeatherCode = data.current.weather_code;
        weatherDescription.textContent = getWeatherDescription(currentWeatherCode);
        highTemp.textContent = Math.round(data.daily.temperature_2m_max[0]);
        lowTemp.textContent = Math.round(data.daily.temperature_2m_min[0]);
        
        // Update background based on weather
        updateWeatherAnimation(currentWeatherCode);
    }

    function displayHourlyForecast(data) {
        hourlyForecast.innerHTML = ''; // Clear previous data
        const now = new Date();
        const currentHour = now.getHours();

        for (let i = currentHour; i < currentHour + 24; i++) {
            const time = new Date(data.hourly.time[i]);
            const hour = time.getHours();
            
            const item = document.createElement('div');
            item.className = 'hourly-item';
            item.innerHTML = `
                <p>${hour}:00</p>
                <p>${getWeatherIcon(data.hourly.weather_code[i])}</p>
                <p>${Math.round(data.hourly.temperature_2m[i])}°</p>
            `;
            hourlyForecast.appendChild(item);
        }
    }

    function displayDailyForecast(data) {
        dailyForecast.innerHTML = ''; // Clear previous data
        for (let i = 0; i < 10; i++) {
            const date = new Date(data.daily.time[i]);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });

            const item = document.createElement('div');
            item.className = 'daily-item';
            item.innerHTML = `
                <p>${day}</p>
                <span>${getWeatherIcon(data.daily.weather_code[i])}</span>
                <p>${Math.round(data.daily.temperature_2m_min[i])}° / ${Math.round(data.daily.temperature_2m_max[i])}°</p>
            `;
            dailyForecast.appendChild(item);
        }
    }

    function displayWeatherDetails(data) {
        uvIndex.textContent = Math.round(data.daily.uv_index_max[0]);
        sunrise.textContent = new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        sunset.textContent = new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        windSpeed.textContent = `${Math.round(data.current.wind_speed_10m)} mph`;
        precipitation.textContent = `${data.hourly.precipitation_probability[new Date().getHours()]}%`;
        airQuality.textContent = 'Good'; // Static value
    }

    function getWeatherDescription(code) {
        const descriptions = {
            0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Fog", 48: "Depositing rime fog",
            51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
            61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
            80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers"
            // Add more as needed
        };
        return descriptions[code] || "Unknown";
    }

    function getWeatherIcon(code) {
         const icons = {
            0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
            45: "🌫️", 48: "🌫️",
            51: "💧", 53: "💧", 55: "💧",
            61: "🌧️", 63: "🌧️", 65: "🌧️",
            80: "🌦️", 81: "🌦️", 82: "🌦️"
        };
        return icons[code] || "❓";
    }

    function updateWeatherAnimation(code) {
        const container = document.getElementById('weather-container');
        container.className = 'weather-container'; // Reset classes
        if (code === 0 || code === 1) {
            container.classList.add('clear-sky');
        } else if (code === 2 || code === 3) {
            container.classList.add('cloudy');
        } else if (code >= 51 && code <= 82) {
            container.classList.add('rainy');
        } else {
             container.classList.add('cloudy'); // Default
        }
    }
});
