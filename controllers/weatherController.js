import axios from 'axios';

const WEATHER_API_KEY = '243fc3d6a1c5445498c170704242108';
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/forecast.json';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_API_KEY = '5d7c47358580d0c767a2650745ac920f272ec422258c1c45270070c41b7f3ee7';
import fetch from 'node-fetch'; // Ensure you import fetch if using Node.js
const API_KEY="5d7c47358580d0c767a2650745ac920f272ec422258c1c45270070c41b7f3ee7";
const AMBEEDATA_API_KEY = API_KEY;
const GEOLOCATION_API_URL = 'https://ipinfo.io/json?token=6622745470134a'; // Example URL

// Updated function to return only time and average temperature for the next 5 days
export async function getLocationLogLat(req, res) {
  const { location } = req.params;

  try {
    // Fetch latitude and longitude using Nominatim
    const nominatimResponse = await axios.get(NOMINATIM_API_URL, {
      params: {
        q: location,
      },
      headers: { 'x-api-key': NOMINATIM_API_KEY },
    });

    if (nominatimResponse.data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const lat = nominatimResponse.data[0].lat;
    const lon = nominatimResponse.data[0].lon;

    // Fetch weather forecast data using WeatherAPI for 5 days
    const weatherResponse = await axios.get(WEATHER_API_URL, {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        days: 5,
        aqi: 'no',
        alerts: 'no',
      },
    });

    // Extract time and average temperature
    const forecastDays = weatherResponse.data.forecast.forecastday;
    const simplifiedForecast = forecastDays.map(day => ({
      time: day.date,
      avgTempC: day.day.avgtemp_c,
    }));

    // Return latitude, longitude, and simplified weather forecast data
    res.json({
      lat,
      lon,
      forecast: simplifiedForecast,
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

const alertThresholds = {
  CO: 10,
  NO2: 50,
  OZONE: 100,
  PM10: 50,
  PM25: 35,
  SO2: 20,
  AQI: 100,
  temperature: { min: 0, max: 35 },  // Example thresholds for extreme temperatures in °C
  windSpeed: 20,  // Threshold for high wind speed in m/s
  precipitation: 5  // Threshold for rain in mm
};

export const analyzeWeatherData = (weatherData) => {
  const { CO, NO2, OZONE, PM10, PM25, SO2, AQI, windSpeed, precipitation } = weatherData;
  
  let pollutionAlerts = [];
  let weatherAlerts = [];
  let isWeatherGood = true;

  // Analyze pollution data
  if (CO && CO > alertThresholds.CO) pollutionAlerts.push("High Carbon Monoxide levels detected.");
  if (NO2 && NO2 > alertThresholds.NO2) pollutionAlerts.push("High Nitrogen Dioxide levels detected.");
  if (OZONE && OZONE > alertThresholds.OZONE) pollutionAlerts.push("High Ozone levels detected.");
  if (PM10 && PM10 > alertThresholds.PM10) pollutionAlerts.push("High PM10 levels detected.");
  if (PM25 && PM25 > alertThresholds.PM25) pollutionAlerts.push("High PM2.5 levels detected.");
  if (SO2 && SO2 > alertThresholds.SO2) pollutionAlerts.push("High Sulfur Dioxide levels detected.");
  if (AQI && AQI > alertThresholds.AQI) pollutionAlerts.push("Unhealthy Air Quality Index detected.");

  // Analyze weather conditions (excluding temperature as it's not available)
  if (windSpeed && windSpeed > alertThresholds.windSpeed) {
    weatherAlerts.push("High wind speed detected.");
    isWeatherGood = false;
  }

  if (precipitation && precipitation > alertThresholds.precipitation) {
    weatherAlerts.push("Heavy rain detected.");
    isWeatherGood = false;
  }

  // Determine final message for weather conditions
  if (isWeatherGood && weatherAlerts.length === 0) {
    weatherAlerts.push("Overall weather conditions are good.");
  } else {
    weatherAlerts.push("Overall weather conditions are not good.");
  }

  return { pollutionAlerts, weatherAlerts };
};

export const getWeatherAlertByLocation = async (req, res) => {
  try {
    let latitude;
    let longitude;

    // Extract destination from POST request body
    const { destination, lat, lon } = req.body;

    if (destination) {
      // Get coordinates for the destination using OpenCage Geocoding API
      const geoResponse = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destination)}&key=8b003d59e6c34328bc22f727b65c7ab4`);
      const location = geoResponse.data.results[0]?.geometry;
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
      latitude = location.lat;
      longitude = location.lng;
    } else if (lat && lon) {
      // Use coordinates from request body
      latitude = lat;
      longitude = lon;
    } else {
      // Get the client's IP address
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if (!ipAddress) {
        return res.status(400).json({ error: 'IP address not found' });
      }

      // Fetch geolocation data based on IP address using ipinfo.io
      const geoResponse = await axios.get(`https://ipinfo.io/${ipAddress}/json?token=6622745470134a`);
      const loc = geoResponse.data.loc.split(',');
      latitude = loc[0];
      longitude = loc[1];
    }

    // Fetch weather data based on latitude and longitude
    const weatherResponse = await axios.get(`https://api.ambeedata.com/latest/by-lat-lng?lat=${latitude}&lng=${longitude}`, {
      headers: {
        'x-api-key': AMBEEDATA_API_KEY
      }
    });

    const weatherData = weatherResponse.data.stations[0]; // Assuming this is the correct structure

    // Use the analyzeWeatherData function to analyze the weather data
    const { pollutionAlerts, weatherAlerts } = analyzeWeatherData(weatherData);

    if (pollutionAlerts.length > 0 || weatherAlerts.length > 0) {
      return res.status(200).json({
        message: 'Weather alerts detected',
        pollutionAlerts,
        weatherAlerts
      });
    } else {
      return res.status(200).json({
        message: 'No significant weather alerts detected',
        pollutionAlerts: [],
        weatherAlerts: []
      });
    }
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
};
