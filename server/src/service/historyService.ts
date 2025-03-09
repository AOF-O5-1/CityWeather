import * as fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Use fileURLToPath to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class City {
  constructor(
    public id: number,    // Unique identifier for the city
    public name: string   // Name of the city
  ) {}
}

class HistoryService {
  // Updated filePath: Now resolves to the same directory as HistoryService.ts.
  private readonly filePath = path.join(__dirname, 'searchHistory.json');

  // Reads the JSON file and returns an array of City objects.
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      // If the file exists but is empty, return an empty array
      if (!data.trim()) {
        return [];
      }
      return JSON.parse(data) as City[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // If the file doesn't exist, create it with an empty array
        await this.write([]);
        return [];
      }
      throw new Error('Error reading search history file');
    }
  }
  
  // Writes the updated cities array to the JSON file.
  private async write(cities: City[]): Promise<void> {
    try {
      // Ensure the directory exists
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      
      const data = JSON.stringify(cities, null, 2);
      await fs.writeFile(this.filePath, data, 'utf8');
    } catch (error) {
      console.error('Error writing to file:', error);
      throw new Error('Error writing to search history file');
    }
  }

  // Returns the array of cities from the JSON file.
  async getCities(): Promise<City[]> {
    try {
      const cities = await this.read();
      return cities;
    } catch (error) {
      console.error('Error getting cities:', error);
      throw new Error('Error fetching cities from search history');
    }
  }

  // Adds a new city to the search history or updates existing one
  async addCity(cityName: string): Promise<void> {
    try {
      const cities = await this.getCities();

      // Check if the city already exists (case-insensitive)
      const existingCityIndex = cities.findIndex(
        city => city.name.toLowerCase() === cityName.toLowerCase()
      );

      if (existingCityIndex >= 0) {
        // City exists - you could update timestamp or move to top of list if needed
        console.log(`City "${cityName}" already exists in the history.`);
        
        // Optional: Move city to the top of the list (most recent)
        const existingCity = cities.splice(existingCityIndex, 1)[0];
        cities.push(existingCity);
        
        // Write the updated order back to the file
        await this.write(cities);
        return;
      }

      // Generate a new unique ID for the new city.
      const newId = cities.length > 0 ? Math.max(...cities.map(city => city.id)) + 1 : 1;

      // Create and add the new city.
      const newCity = new City(newId, cityName);
      cities.push(newCity);

      // Write the updated list back to the file.
      await this.write(cities);
      console.log(`City "${cityName}" has been added to history.`);
    } catch (error) {
      console.error('Error in addCity:', error);
      if (error instanceof Error) {
        throw new Error(`Error adding city: ${error.message}`);
      } else {
        throw new Error('Error adding city: Unknown error');
      }
    }
  }

  // Remove a city from the search history.
  async removeCity(id: number): Promise<void> {
    try {
      const cities = await this.getCities();
      const cityIndex = cities.findIndex(city => city.id === id);
      
      if (cityIndex === -1) {
        throw new Error(`City with ID ${id} not found.`);
      }
      
      const cityName = cities[cityIndex].name;
      cities.splice(cityIndex, 1);
      await this.write(cities);
      console.log(`City "${cityName}" with ID ${id} has been removed.`);
    } catch (error) {
      console.error('Error in removeCity:', error);
      if (error instanceof Error) {
        throw new Error(`Error removing city: ${error.message}`);
      } else {
        throw new Error('Error removing city: Unknown error');
      }
    }
  }
}

export default new HistoryService();