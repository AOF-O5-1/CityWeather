import './styles/jass.css';

// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  'search-form'
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  'search-input'
) as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  'history'
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  'search-title'
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  'weather-img'
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  'temp'
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  'wind'
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  'humidity'
) as HTMLParagraphElement;

// Define interfaces for type safety
interface CurrentWeather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}

interface ForecastDay {
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}


interface CityHistory {
  id: string;
  name: string;
}

/*

API Calls

*/

const fetchWeather = async (cityName: string) => {
  try {
    console.log('cityName: ', cityName);
    const response = await fetch('/api/weather', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cityName }),
    });

    if (!response.ok) {
      console.error('API Error:', response.status);
      throw new Error(`Weather API responded with status: ${response.status}`);
    }

    const weatherData = await response.json();
    console.log('Response status:', response.status);
    console.log('Full weather data:', weatherData);

    // Check if the response has the expected structure
    if (!weatherData || !weatherData.currentWeather) {
      console.error('Invalid weather data format:', weatherData);
      throw new Error('Weather data not in expected format');
    }

    renderCurrentWeather(weatherData.currentWeather);
    renderForecast(weatherData.forecast || []);
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    handleWeatherError();
    return null;
  }
};

const fetchSearchHistory = async () => {
  try {
    const response = await fetch('/api/weather/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`History API responded with status: ${response.status}`);
    }
    
    console.log('history response: ', response);
    return response;
    
  } catch (error: any) {
    console.log("Error fetching history: ", error);
    return error.message;
  }
};

const deleteCityFromHistory = async (id: string) => {
  try {
    const response = await fetch(`/api/weather/history/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Delete API responded with status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting city:', error);
    return false;
  }
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: CurrentWeather | null): void => {
  // Add a check to ensure currentWeather is defined
  if (!currentWeather) {
    console.error('Current weather data is undefined');
    heading.textContent = 'Weather data not available';
    weatherIcon.setAttribute('src', '');
    weatherIcon.setAttribute('alt', '');
    tempEl.textContent = '';
    windEl.textContent = '';
    humidityEl.textContent = '';
    
    if (todayContainer) {
      todayContainer.innerHTML = '';
      todayContainer.append(heading, tempEl, windEl, humidityEl);
    }
    return;
  }

  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } = currentWeather;

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  
  // Create a new heading element to avoid appending the icon multiple times
  const headingClone = heading.cloneNode(true) as HTMLHeadingElement;
  headingClone.append(weatherIcon);
  
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(headingClone, tempEl, windEl, humidityEl);
  }
};

const renderForecast = (forecast: ForecastDay[]): void => {
  if (!forecast || !forecast.length) {
    if (forecastContainer) {
      forecastContainer.innerHTML = '<div class="col-12"><h4>No forecast data available</h4></div>';
    }
    return;
  }

  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  if (forecastContainer) {
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
  }

  for (let i = 0; i < forecast.length; i++) {
    renderForecastCard(forecast[i]);
  }
};

const renderForecastCard = (forecast: ForecastDay) => {
  if (!forecast) return;
  
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  // Add content to elements
  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

const renderSearchHistory = async (searchHistory: Response | string) => {
  if (typeof searchHistory === 'string') {
    if (searchHistoryContainer) {
      searchHistoryContainer.innerHTML = `<p class="text-center">Error: ${searchHistory}</p>`;
    }
    return;
  }

  try {
    const historyList = await searchHistory.json();

    if (searchHistoryContainer) {
      searchHistoryContainer.innerHTML = '';

      if (!historyList || !historyList.length) {
        searchHistoryContainer.innerHTML =
          '<p class="text-center">No Previous Search History</p>';
        return;
      }

      // * Start at end of history array and count down to show the most recent cities at the top.
      for (let i = historyList.length - 1; i >= 0; i--) {
        const historyItem = buildHistoryListItem(historyList[i]);
        searchHistoryContainer.append(historyItem);
      }
    }
  } catch (error) {
    console.error('Error rendering search history:', error);
    if (searchHistoryContainer) {
      searchHistoryContainer.innerHTML = '<p class="text-center">Error loading search history</p>';
    }
  }
};

/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add(
    'forecast-card',
    'card',
    'text-white',
    'bg-primary',
    'h-100'
  );
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;

  return btn;
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add(
    'fas',
    'fa-trash-alt',
    'delete-city',
    'btn',
    'btn-danger',
    'col-2'
  );

  delBtnEl.addEventListener('click', handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: CityHistory) => {
  if (!city || !city.name) {
    console.error('Invalid city object:', city);
    return document.createElement('div'); // Return empty div
  }

  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

const handleWeatherError = () => {
  heading.textContent = 'Error fetching weather data';
  tempEl.textContent = '';
  windEl.textContent = '';
  humidityEl.textContent = '';
  
  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
  }
  
  if (forecastContainer) {
    forecastContainer.innerHTML = '<div class="col-12"><h4>No forecast data available</h4></div>';
  }
};

/*

Event Handlers

*/

const handleSearchFormSubmit = (event: Event): void => {
  event.preventDefault();

  if (!searchInput.value) {
    alert('City cannot be blank');
    return;
  }

  const search: string = searchInput.value.trim();
  fetchWeather(search).then((data) => {
    if (data) {
      getAndRenderHistory();
    }
  });
  searchInput.value = '';
};

const handleSearchHistoryClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.matches('.history-btn')) {
    const city = target.textContent;
    if (city) {
      fetchWeather(city).then((data) => {
        if (data) {
          getAndRenderHistory();
        }
      });
    }
  }
};

const handleDeleteHistoryClick = (event: Event) => {
  event.stopPropagation();
  const target = event.target as HTMLElement;
  const cityDataString = target.getAttribute('data-city');
  
  if (!cityDataString) {
    console.error('No city data found');
    return;
  }
  
  try {
    const cityData = JSON.parse(cityDataString);
    if (cityData && cityData.id) {
      deleteCityFromHistory(cityData.id).then(getAndRenderHistory);
    } else {
      console.error('Invalid city data:', cityData);
    }
  } catch (error) {
    console.error('Error parsing city data:', error);
  }
};

/*

Initial Render

*/

const getAndRenderHistory = () => {
  return fetchSearchHistory()
    .then(renderSearchHistory)
    .catch(error => {
      console.error('Error in getAndRenderHistory:', error);
    });
};

// Add event listeners with proper error handling
if (searchForm) {
  searchForm.addEventListener('submit', handleSearchFormSubmit);
} else {
  console.error('Search form element not found');
}

if (searchHistoryContainer) {
  searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);
} else {
  console.error('Search history container element not found');
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  getAndRenderHistory();
});