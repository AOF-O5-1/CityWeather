# Weather Dashboard
A responsive web application that allows travelers to check current weather conditions and 5-day forecasts for multiple cities, helping them plan trips accordingly.
Show Image
Features

## City Search: Search for any city worldwide to view its weather data
Current Weather: View current conditions including city name, date, weather icon, temperature, humidity, and wind speed
5-Day Forecast: See a 5-day forecast with weather conditions, temperature, wind speed, and humidity
Search History: Previously searched cities are saved and can be quickly accessed with a single click
Responsive Design: Works on desktop, tablet, and mobile devices

## Technology Stack

Frontend: HTML, CSS, JavaScript, TypeScript
Backend: Node.js, Express
APIs: OpenWeatherMap API
Build Tools: Vite, TypeScript

## Installation

Clone the repository:
bashCopygit clone https://github.com/yourusername/weather-dashboard.git
cd weather-dashboard

Install dependencies for both client and server:
bashCopy# Install server dependencies
cd server
npm install

### Install client dependencies
cd ../client
npm install

Create a .env file in the server directory with your OpenWeatherMap API key:
Copy 
WEATHER_API_KEY=your_api_key_here
WEATHER_API_URL=https://api.openweathermap.org

### Build the application:
bashCopy# Build the server
cd server
npm run build

### Build the client
cd ../client
npm run build

Start the application:
bashCopy# Start the server
cd server
npm start

Open your browser and navigate to http://localhost:3000

## Usage

Enter a city name in the search box and click the search button
View the current weather and 5-day forecast for the searched city
Previously searched cities appear in the history panel on the left
Click on any city in the history to view its weather again
Use the delete button (trash icon) to remove cities from your history



Geocoding API for converting city names to coordinates
5-day/3-hour Forecast API for weather data

## Future Enhancements

Add user accounts to save personalized city lists
Implement weather alerts for saved cities
Add temperature unit conversion (Celsius/Fahrenheit)
Include additional weather metrics like UV index and precipitation chance

## License
This project is licensed under the MIT License - see the LICENSE file for details.
Contact

GitHub: github.com/AOF-O5-1
Email: marcusfajemisin@gmail.com
