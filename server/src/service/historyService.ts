import * as fs from 'fs/promises'; // Import Node.js file system module for promises

// TODO: Define a City class with name and id properties
// City class definition
class City {
    constructor(
        public id: number,    // Unique identifier for the city
        public name: string   // Name of the city
    ) { }
}

// TODO: Complete the HistoryService class
class HistoryService {
    private readonly filePath = 'server/src/service/searchHistory.json'; // Path to the search history file
    // TODO: Define a read method that reads from the searchHistory.json file
    private async read(): Promise<City[]> {
        try {
            //Convert the array to a JSON string with formatting
            const data = JSON.stringify(City, null, 2);
            // Read the file contents as a string
            await fs.readFile(this.filePath, 'utf8');

            // Parse the JSON and convert it into an array of City objects
            return JSON.parse(data) as City[];
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                // If the file doesn't exist, return an empty array
                return [];
            }
            // Handle other potential errors
            throw new Error('Error reading search history file');
        }
    }
    // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
    private async write(cities: City[]): Promise<void> {
        try {
            // Convert the cities array to a JSON string with formatting
            const data = JSON.stringify(cities, null, 2);

            // Write the JSON string to the file
            await fs.writeFile(this.filePath, data, 'utf8');
        } catch (error) {
            // Handle errors during the file write operation
            throw new Error('Error writing to search history file');
        }
    }
    // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
    async getCities(): Promise<City[]> {
        try {
            // Use the read method to fetch cities from the JSON file
            const cities = await this.read();

            // Return the cities as an array of City objects
            return cities;
        } catch (error) {
            // Handle any errors from the read method
            throw new Error('Error fetching cities from search history');
        }
    }
    // TODO Define an addCity method that adds a city to the searchHistory.json file
    async addCity(cityName: string): Promise<void> {
        try {
            // Fetch the current list of cities
            const cities = await this.getCities();

            // Check if the city already exists (case-insensitive)
            if (cities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
                throw new Error(`City "${cityName}" already exists in the history.`);
            }

            // Generate a new unique ID for the new city
            const newId = cities.length > 0 ? Math.max(...cities.map(city => city.id)) + 1 : 1;

            // Create a new City object and add it to the array
            const newCity = new City(newId, cityName);
            cities.push(newCity);

            // Write the updated list of cities back to the file
            await this.write(cities);

            console.log(`City "${cityName}" has been added.`);
        } catch (error) {
            // Handle errors
            if (error instanceof Error) {
                throw new Error(`Error adding city: ${error.message}`);
            } else {
                throw new Error('Error adding city: Unknown error');
            }
        }
    }
    // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
    async removeCity(id: number): Promise<void> {
        try {
            // Fetch the current list of cities
            const cities = await this.getCities();

            // Check if the city with the specified ID exists
            const cityIndex = cities.findIndex(city => city.id === id);
            if (cityIndex === -1) {
                throw new Error(`City with ID ${id} not found.`);
            }

            // Remove the city from the array
            cities.splice(cityIndex, 1);

            // Write the updated list of cities back to the file
            await this.write(cities);

            console.log(`City with ID ${id} has been removed.`);
        } catch (error) {
            // Handle errors
            if (error instanceof Error) {
                throw new Error(`Error removing city: ${error.message}`);
            } else {
                throw new Error('Error removing city: Unknown error');
            }
        }
    }


}

export default new HistoryService();
