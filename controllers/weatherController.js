import axios from 'axios';

const WEATHER_API_KEY = '243fc3d6a1c5445498c170704242108';
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/current.json';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_API_KEY = '5d7c47358580d0c767a2650745ac920f272ec422258c1c45270070c41b7f3ee7';
import fetch from 'node-fetch'; // Ensure you import fetch if using Node.js
const API_KEY="5d7c47358580d0c767a2650745ac920f272ec422258c1c45270070c41b7f3ee7";
const AMBEEDATA_API_KEY = API_KEY;
const GEOLOCATION_API_URL = 'https://ipinfo.io/json?token=6622745470134a'; // Example URL

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
    const { id } = req.params; // Assuming the ID is used to look up latitude and longitude

    // Retrieve latitude and longitude based on the ID from your database
    // For this example, assume you have a function `getCoordinatesById`:
    const coordinates = await getCoordinatesById(id); 
    if (!coordinates) {
      return res.status(404).json({ error: 'Coordinates not found' });
    }

    const { latitude, longitude } = coordinates;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
  
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
  
    const data = await response.json();
  
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Define thresholds for different pollutants
const alertThresholds = {
  CO: 10,        // Example threshold for Carbon Monoxide
  NO2: 50,       // Example threshold for Nitrogen Dioxide
  OZONE: 100,    // Example threshold for Ozone
  PM10: 50,      // Example threshold for PM10
  PM25: 35,      // Example threshold for PM2.5
  SO2: 20,       // Example threshold for Sulfur Dioxide
  AQI: 100       // Example threshold for Air Quality Index (AQI)
};

// Gemini model to analyze weather data and determine if alerts should be triggered
export const analyzeWeatherData = (weatherData) => {
  const { CO, NO2, OZONE, PM10, PM25, SO2, AQI } = weatherData;
  let alerts = [];
  let isWeatherGood = true; // Flag to track overall weather condition

  // Check each parameter against the threshold
  if (CO) {
    if (CO > alertThresholds.CO) {
      alerts.push("High Carbon Monoxide levels detected.");
      isWeatherGood = false;
    } else if (CO < alertThresholds.CO) {
      alerts.push("Carbon Monoxide levels are within safe limits.");
    }
  }

  if (NO2) {
    if (NO2 > alertThresholds.NO2) {
      alerts.push("High Nitrogen Dioxide levels detected.");
      isWeatherGood = false;
    } else if (NO2 < alertThresholds.NO2) {
      alerts.push("Nitrogen Dioxide levels are within safe limits.");
    }
  }

  if (OZONE) {
    if (OZONE > alertThresholds.OZONE) {
      alerts.push("High Ozone levels detected.");
      isWeatherGood = false;
    } else if (OZONE < alertThresholds.OZONE) {
      alerts.push("Ozone levels are within safe limits.");
    }
  }

  if (PM10) {
    if (PM10 > alertThresholds.PM10) {
      alerts.push("High PM10 levels detected.");
      isWeatherGood = false;
    } else if (PM10 < alertThresholds.PM10) {
      alerts.push("PM10 levels are within safe limits.");
    }
  }

  if (PM25) {
    if (PM25 > alertThresholds.PM25) {
      alerts.push("High PM2.5 levels detected.");
      isWeatherGood = false;
    } else if (PM25 < alertThresholds.PM25) {
      alerts.push("PM2.5 levels are within safe limits.");
    }
  }

  if (SO2) {
    if (SO2 > alertThresholds.SO2) {
      alerts.push("High Sulfur Dioxide levels detected.");
      isWeatherGood = false;
    } else if (SO2 < alertThresholds.SO2) {
      alerts.push("Sulfur Dioxide levels are within safe limits.");
    }
  }

  if (AQI) {
    if (AQI > alertThresholds.AQI) {
      alerts.push("Unhealthy Air Quality Index detected.");
      isWeatherGood = false;
    } else if (AQI < alertThresholds.AQI) {
      alerts.push("Air Quality Index is in a healthy range.");
    }
  }

  // Add a final summary alert for overall weather conditions
  if (isWeatherGood) {
    alerts.push("Overall weather conditions are good.");
  } else {
    alerts.push("Overall weather conditions are not good.");
  }

  return alerts;
};


export const getWeatherAlertByLocation = async (req, res) => {
  try {
    // Get the client's IP address
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address not found' });
    }

    // Fetch geolocation data
    const geoResponse = await axios.get(GEOLOCATION_API_URL);
    const loc = geoResponse.data.loc.split(',');
    const latitude = loc[0];
    const longitude = loc[1];

    // Fetch weather data based on location
    const weatherResponse = await axios.get(`https://api.ambeedata.com/latest/by-lat-lng?lat=${latitude}&lng=${longitude}`, {
      headers: {
        'x-api-key': AMBEEDATA_API_KEY
      }
    });

    const weatherData = weatherResponse.data.stations[0]; // Assume this is the correct structure

    // Use the Gemini model to analyze the weather data
    const alerts = analyzeWeatherData(weatherData);

    if (alerts.length > 0) {
      return res.status(200).json({ message: 'Weather alerts detected', alerts });
    } else {
      return res.status(200).json({ message: 'No weather alerts detected', alerts: [] });
    }
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
};
