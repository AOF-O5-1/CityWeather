import express from 'express';
import bodyParser from 'body-parser';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Path to the searchHistory.json file
const searchHistoryPath = path.join(__dirname, './searchHistory.json');

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies

// Utility function to read JSON file
const readSearchHistory = async () => {
  try {
    const data = await fs.readFile(searchHistoryPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    
  }
};

// Utility function to write JSON file
const writeSearchHistory = async (data: any) => {
  try {
    await fs.writeFile(searchHistoryPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
};

// Route: GET /api/weather/history
app.get('/api/weather/history', async (_req, res) => {
  try {
    const history = await readSearchHistory();
    res.json(history);
  } catch (error) {
    console.error('Error reading search history:', error);
    res.status(500).json({ error: 'Failed to read search history' });
  }
});

// Route: POST /api/weather
app.post('/api/weather', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const history = await readSearchHistory();

    // Generate a unique ID and add the new city
    const newCity = {
      id: uuidv4(),
      name,
    };
    history.push(newCity);

    // Write the updated history to the file
    await writeSearchHistory(history);

    // Simulate returning weather data (replace this with actual weather API integration)
    const weatherData = {
      city: name,
      temperature: Math.floor(Math.random() * 35) + 1, // Random temperature for demonstration
      description: 'Sunny', // Example description
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Error saving city:', error);
    res.status(500).json({ error: 'Failed to save city' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
