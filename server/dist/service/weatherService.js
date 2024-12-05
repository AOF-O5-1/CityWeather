import dotenv from 'dotenv';
dotenv.config();
// TODO: Define a class for the Weather object
class Weather {
    constructor(city, temperature, description, icon, humidity, windSpeed, forecast) {
        this.city = city;
        this.temperature = temperature;
        this.description = description;
        this.icon = icon;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.forecast = forecast;
    }
}
// TODO: Complete the WeatherService class
class WeatherService {
    constructor() {
        // TODO: Define the baseURL, API key, and city name properties
        this.API_Key = process.env.WEATHER_API_KEY;
        this.baseURL = 'https://api.openweathermap.org/data/2.5/';
        this.cityName = '';
    }
    // TODO: Create fetchLocationData method
    async fetchLocationData(query) {
        // Fetch the location data from the API
        const response = await fetch(`${this.baseURL}weather?q=${query}&appid=${this.API_Key}`);
        return await response.json();
    }
    // TODO: Create destructureLocationData method
    destructureLocationData(locationData) {
        // Destructure the latitude and longitude from the location data
        const { lat, lon } = locationData;
        return { lat, lon };
    }
    // TODO: Create buildGeocodeQuery method
    //private buildGeocodeQuery(): string {
    //return `geocode/json?address=${this.cityName}&key=${this.API_Key}`;
    //}
    // TODO: Create buildWeatherQuery method
    buildWeatherQuery(coordinates) {
        return `${this.baseURL}onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&appid=${this.API_Key}`;
    }
    // TODO: Create fetchAndDestructureLocationData method
    async fetchAndDestructureLocationData() {
        // Fetch location data from the API
        const locationData = await this.fetchLocationData(this.cityName);
        //extract the coordinates from the location data 
        const coordinates = this.destructureLocationData(locationData);
        return coordinates;
    }
    // TODO: Create fetchWeatherData method
    async fetchWeatherData(coordinates) {
        // Build the weather query
        const weatherQuery = this.buildWeatherQuery(coordinates);
        // Fetch the weather data from the API
        const response = await fetch(weatherQuery);
        // Check if the response is ok
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return await response.json();
    }
    // TODO: Build parseCurrentWeather method
    parseCurrentWeather(response) {
        const temperature = response.current.temp;
        const condition = response.current.weather[0].description;
        const humidity = response.current.humidity;
        const windSpeed = response.current.wind_speed;
        return { temperature, condition, humidity, windSpeed };
    }
    // TODO: Complete buildForecastArray method
    buildForecastArray(currentWeather, weatherData) {
        // Initialize the forecast array
        const forecastArray = [];
        // Include the current weather as the first entry
        forecastArray.push(currentWeather);
        // Process each forecast entry in the weatherData array
        for (const forecast of weatherData) {
            const temperature = forecast.temp.day; // Average daily temperature
            const condition = forecast.weather[0].description; // Weather description
            const humidity = forecast.humidity; // Humidity percentage
            const windSpeed = forecast.wind_speed; // Wind speed
            // Create a new Weather object and add it to the array
            forecastArray.push(new Weather(this.cityName, temperature, condition, '', humidity, windSpeed, []));
        }
        return forecastArray;
    }
    // TODO: Complete getWeatherForCity method
    async getWeatherForCity(city) {
        try {
            // Set the city name for this request
            this.cityName = city;
            // Fetch and process location data to get coordinates
            const coordinates = await this.fetchAndDestructureLocationData();
            // Fetch weather data for the coordinates
            const weatherResponse = await this.fetchWeatherData(coordinates);
            // Parse the current weather from the response
            const currentWeather = this.parseCurrentWeather(weatherResponse);
            // Build the forecast array from the daily forecast data
            const forecast = this.buildForecastArray(new Weather(this.cityName, currentWeather.temperature, currentWeather.condition, '', currentWeather.humidity, currentWeather.windSpeed, []), weatherResponse.daily);
            // Return the structured result
            return { currentWeather: new Weather(this.cityName, currentWeather.temperature, currentWeather.condition, '', currentWeather.humidity, currentWeather.windSpeed, []), forecast };
        }
        catch (error) {
            console.error(`Error fetching weather for city "${city}":`, error);
            throw new Error('Failed to fetch weather data. Please try again later.');
        }
    }
}
export default new WeatherService();
