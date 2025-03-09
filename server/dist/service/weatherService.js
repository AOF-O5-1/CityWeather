// WeatherService.ts
import dotenv from 'dotenv';
dotenv.config();
class Weather {
    constructor(cityName, tempF, condition, icon, humidity, windSpeed, iconDescription, date = new Date().toLocaleDateString()) {
        this.city = cityName; // Changed from cityName to city to match frontend expectations
        this.tempF = Math.round(tempF);
        this.condition = condition;
        this.icon = icon;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.iconDescription = iconDescription;
        this.date = date;
    }
}
class WeatherService {
    setCityName(cityName) {
        this.cityName = cityName.trim();
    }
    constructor() {
        this.cityName = '';
        // Make sure we're using the correct API key
        this.API_Key = process.env.WEATHER_API_KEY || '15ba3caa8bcecfb17be300f5d5fc2923';
        this.cityName = '';
    }
    async fetchLocationData(query) {
        try {
            console.log('Geocoding API URL:', query);
            const response = await fetch(query);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Geocoding API error (${response.status}):`, errorText);
                throw new Error(`Geocoding API responded with status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching location data:', error);
            throw new Error('Failed to fetch location data');
        }
    }
    destructureLocationData(locationData) {
        console.log("Location Data:", locationData);
        if (!locationData || typeof locationData.lat !== 'number' || typeof locationData.lon !== 'number') {
            throw new Error('Failed to destructure location data');
        }
        return { lat: locationData.lat, lon: locationData.lon };
    }
    buildGeocodeQuery() {
        console.log('Building geocode query for city:', this.cityName);
        const encodedCity = encodeURIComponent(this.cityName);
        // Always use the direct API endpoint
        const geoQuery = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity}&limit=5&appid=${this.API_Key}`;
        console.log('Geocoding API URL:', geoQuery);
        return geoQuery;
    }
    buildWeatherQuery(coordinates) {
        const weatherQuery = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.API_Key}`;
        console.log('Weather API URL:', weatherQuery);
        return weatherQuery;
    }
    async fetchAndDestructureLocationData() {
        const query = this.buildGeocodeQuery();
        const locationData = await this.fetchLocationData(query);
        console.log('Location data received:', locationData);
        if (!Array.isArray(locationData) || locationData.length === 0) {
            throw new Error(`No location data found for "${this.cityName}"`);
        }
        return this.destructureLocationData(locationData[0]);
    }
    async fetchWeatherData(coordinates) {
        try {
            const weatherQuery = this.buildWeatherQuery(coordinates);
            const response = await fetch(weatherQuery);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Weather API error (${response.status}):`, errorText);
                throw new Error(`Weather API responded with status: ${response.status}`);
            }
            const weatherData = await response.json();
            console.log("Weather data received successfully");
            // Format the current weather and forecast data
            const currentWeather = this.parseCurrentWeather(weatherData);
            const forecast = this.buildForecastArray(weatherData.list);
            return { currentWeather, forecast };
        }
        catch (error) {
            console.error('Error fetching weather data:', error);
            throw new Error('Failed to fetch weather data');
        }
    }
    parseCurrentWeather(response) {
        if (!response || !response.list || !response.list[0]) {
            throw new Error('Weather data is missing required fields');
        }
        const currentWeather = response.list[0];
        const weather = currentWeather.weather[0];
        // Get the date in the required format
        const date = new Date(currentWeather.dt * 1000).toLocaleDateString();
        // Since we're using units=imperial, no need to convert temperature
        return new Weather(this.cityName, currentWeather.main.temp, // No need to round here, constructor will do it
        weather.description, weather.icon, currentWeather.main.humidity, currentWeather.wind.speed, weather.description, date);
    }
    buildForecastArray(forecastList) {
        if (!Array.isArray(forecastList) || forecastList.length === 0) {
            console.error('Failed to parse forecast data', forecastList);
            throw new Error('Failed to parse forecast data');
        }
        const forecastMap = new Map();
        // Group forecasts by day
        for (let i = 0; i < forecastList.length; i++) {
            const forecast = forecastList[i];
            const date = new Date(forecast.dt * 1000);
            const dateKey = date.toLocaleDateString();
            // Skip the current day
            if (dateKey === new Date().toLocaleDateString()) {
                continue;
            }
            // Look for forecasts around noon
            const hour = date.getHours();
            if (hour >= 11 && hour <= 13 && !forecastMap.has(dateKey)) {
                forecastMap.set(dateKey, new Weather(this.cityName, forecast.main.temp, forecast.weather[0].description, forecast.weather[0].icon, forecast.main.humidity, forecast.wind.speed, forecast.weather[0].description, dateKey));
            }
        }
        // Convert map to array and take only the first 5 days
        return Array.from(forecastMap.values()).slice(0, 5);
    }
    async getWeatherForCity(cityName) {
        this.cityName = cityName.trim();
        if (!this.cityName) {
            throw new Error('City name is required');
        }
        console.log(`Getting weather for city: ${this.cityName}`);
        const coordinates = await this.fetchAndDestructureLocationData();
        if (!coordinates) {
            throw new Error('Failed to fetch location data');
        }
        return await this.fetchWeatherData(coordinates);
    }
}
export default new WeatherService();
