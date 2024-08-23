import axios from 'axios';

const WEATHER_API_KEY = '243fc3d6a1c5445498c170704242108';
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/current.json';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_API_KEY = '5d7c47358580d0c767a2650745ac920f272ec422258c1c45270070c41b7f3ee7';


// Controller function to fetch weather data
export async function getLocationLogLat(req, res) {
  const { location } = req.params;

  try {
    // Fetch latitude and longitude using Nominatim
    const nominatimResponse = await axios.get(NOMINATIM_API_URL, {
      params: {
        q: location,
        format: 'json',
      },
      headers: { 'x-api-key': NOMINATIM_API_KEY },
    });

    if (nominatimResponse.data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const lat = nominatimResponse.data[0].lat;
    const lon = nominatimResponse.data[0].lon;

    // Fetch weather data using WeatherAPI
    const weatherResponse = await axios.get(WEATHER_API_URL, {
      params: {
        key: WEATHER_API_KEY,
        q: `${lat},${lon}`,
        aqi: 'yes',
      },
    });

    // Return latitude, longitude, and weather data
    res.json({
      lat,
      lon,
      weather: weatherResponse.data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
}

export const getWeatherForecast = async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
  
      // Validate the latitude and longitude
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
  
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
  
      const response = await fetch(url);
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Return the data as JSON
      res.json(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };