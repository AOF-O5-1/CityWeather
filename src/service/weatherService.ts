import dotenv from 'dotenv';
dotenv.config();

 

// TODO: Define an interface for the Coordinates object
interface Coordinates { 
  lat: number;
  lon: number;
}


// TODO: Define a class for the Weather object
class Weather {
  constructor(
    public city: string,
    public temperature: number,
    public description: string,
    public icon: string,
    public humidity: number,
    public windSpeed: number,
    public forecast: Weather[]
  ) {}
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private API_Key: string = process.env.WEATHER_API_KEY as string;
  private baseURL: string = 'https://api.openweathermap.org/data/2.5/';
  private cityName: string = ''; 
  // TODO: Create fetchLocationData method
   private async fetchLocationData(query: string): Promise<any> {
    // Fetch the location data from the API
    const response = await fetch(`${this.baseURL}weather?q=${query}&appid=${this.API_Key}`);
    return await response.json();
   }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    // Destructure the latitude and longitude from the location data
    const { lat, lon } = locationData; 
    return { lat, lon };
  }
  // TODO: Create buildGeocodeQuery method
   //private buildGeocodeQuery(): string {
    //return `geocode/json?address=${this.cityName}&key=${this.API_Key}`;
   //}
  // TODO: Create buildWeatherQuery method
   private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&appid=${this.API_Key}`;
   }
  // TODO: Create fetchAndDestructureLocationData method
   private async fetchAndDestructureLocationData() {
    // Fetch location data from the API
    const locationData = await this.fetchLocationData(this.cityName);
    //extract the coordinates from the location data 
    const coordinates = this.destructureLocationData(locationData);

    return coordinates;
   }
  // TODO: Create fetchWeatherData method
   private async fetchWeatherData(coordinates: Coordinates) {
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
  private parseCurrentWeather(response: any) {
    const temperature = response.current.temp;
    const condition = response.current.weather[0].description;
    const humidity = response.current.humidity;
    const windSpeed = response.current.wind_speed;

    return { temperature, condition, humidity, windSpeed };
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    // Initialize the forecast array
    const forecastArray: Weather[] = [];

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
  public async getWeatherForCity(city: string): Promise<{ currentWeather: Weather; forecast: Weather[] }> {
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
  } catch (error) {
      console.error(`Error fetching weather for city "${city}":`, error);
      throw new Error('Failed to fetch weather data. Please try again later.');
  }
  }
}

export default new WeatherService();
