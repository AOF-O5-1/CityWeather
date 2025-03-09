import { Router, type Request, type Response } from 'express';
const router = Router();

 import HistoryService from '../../service/historyService.js';
 import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log("Request: ", req.body);
    // Get weather data
    const weatherData = await WeatherService.getWeatherForCity(req.body.cityName);
    // Save the city to search history
    await HistoryService.addCity(req.body.cityName);
    // Return the weather data to the client
    res.json(weatherData);
  } catch (error) {
    console.error("Error in POST /api/weather:", error);
    res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});


// TODO: GET search history
router.get('/history', async (_req: Request, _res: Response) => {
  try {
    
    const cities = await HistoryService.getCities();
    console.log("History: ", cities);
    _res.json(cities);

  } catch (error) {
    console.error(error);
    _res.status(500).send('Error fetching search history');
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (_req: Request, _res: Response) => {});

export default router;
