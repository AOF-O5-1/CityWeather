import dotenv from 'dotenv';

dotenv.config();



// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}


// TODO: Define a class for the Weather object
class Weather {
  cityName: string;
  tempF: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  iconDescription: string;

  constructor(cityName: string, tempF: number, condition: string, icon: string, humidity: number, windSpeed: number, iconDescription: string) {
    this.cityName = cityName;
    this.tempF = tempF;
    this.condition = condition;
    this.icon = icon;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.iconDescription = iconDescription;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private API_Key: string ;
  private baseURL: string;  
  private cityName ='';
  
  constructor() {
    this.API_Key = process.env.WEATHER_API_KEY || '';
    this.baseURL = process.env.WEATHER_API_URL || '';
    this.cityName = this.cityName;
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    // Fetch the location data from the API
    const response = await fetch(`${this.baseURL}weather?q=${query}&appid=${this.API_Key}`);
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    return await fetch(query).then((response) => response.json()).catch((error: any) => {
      console.error('Error fetching location data:', error);
      throw new Error('Failed to fetch location data');
    });
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    // Destructure the latitude and longitude from the location data
   if(!locationData || !locationData.lat || !locationData.lon){
      throw new Error('Failed to destructure location data');
    }
    return { lat: locationData.coord.lat, lon: locationData.coord.lon };
  }
  // TODO: Create buildGeocodeQuery method

  private buildGeocodeQuery(): string {
    const geoQuery = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(this.cityName)}&limit=5&appid=${this.API_Key}`;
  return geoQuery;
 }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const weatherQuery = `${this.baseURL}onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&appid=${this.API_Key}`;
    return weatherQuery;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    // Fetch location data from the API
    const locationData = await this.fetchLocationData(query);
    //extract the coordinates from the location data 
    if (!Array.isArray(locationData) || locationData.length === 0) {
      throw new Error('Failed to fetch location data');
    }

    return this.destructureLocationData(locationData[0]);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    // Build the weather query
    try{
    const weatherQuery = this.buildWeatherQuery(coordinates);
    console.log(weatherQuery, 'weatherQuery');
    // Fetch the weather data from the API
    const response = await fetch(weatherQuery);
    // Check if the response is ok
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await response.json();
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);


    return {currentWeather, forecastArray};
  }catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }

  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    if (!response.list || Array.isArray(response.list) || response.list.length === 0) {
      console.error('Failed to parse current weather data', response);
      throw new Error('Failed to parse current weather data');
    } 
    const currentWeather = response.list[0];
    if(!currentWeather || !currentWeather.main || !currentWeather.weather || !currentWeather.weather[0].description || !currentWeather.wind || !currentWeather.wind.speed){
      throw new Error('Weather data is missing required fields');
    }

    return new Weather(
      this.cityName,
      currentWeather.main.tempF,
      currentWeather.weather[0].description,
      currentWeather.weather[0].icon,
      currentWeather.main.humidity,
      currentWeather.wind.speed,
      currentWeather.weather[0].description
    );
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any) {
    // Initialize the forecast array
    if (!Array.isArray(weatherData) || weatherData.length === 0) {
      console.error('Failed to parse forecast data', weatherData);
      throw new Error('Failed to parse forecast data');
    }else{
    // Create a new Weather object for the current weather
    const forecastArray = [new Weather(this.cityName, currentWeather.tempF, currentWeather.condition, '', currentWeather.humidity, currentWeather.windSpeed, '')];

    // Process each forecast entry in the weatherData array
    for (const forecast of weatherData) {
      const temperature = forecast.temp.day; // Average daily temperature
      const condition = forecast.weather[0].description; // Weather description
      const humidity = forecast.humidity; // Humidity percentage
      const windSpeed = forecast.wind_speed; // Wind speed

      // Create a new Weather object and add it to the array
      forecastArray.push(new Weather(this.cityName, temperature, condition, '', humidity, windSpeed, ''));
    }

    return forecastArray;
  }}

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(cityName: string): Promise<{currentWeather: Weather, forecastArray: Weather[]}> {
    // Store the city name
    this.cityName = cityName;
    // Fetch and destructure the location data
    const coordinates = await this.fetchAndDestructureLocationData();
    // Fetch the weather data
    if(!coordinates){
      throw new Error('Failed to fetch location data');
    }
    return await this.fetchWeatherData(coordinates);
  }

  }

export default new WeatherService();
