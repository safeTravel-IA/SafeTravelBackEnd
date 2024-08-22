import express from 'express';

import { getWeather,getWeatherForecast } from '../controllers/weatherController.js';
import { getImages } from '../controllers/destinationController.js'; // Adjust the path as necessary
import { getWeatherByUserLocation } from '../controllers/userController.js';
import { convertCurrency } from '../controllers/convertionController.js';



const router = express.Router();


router.get('/weather/:userId', getWeatherByUserLocation);
router.get('/weather/:location', getWeather);
router.get('/images/:query', getImages);
router.get('/weather', getWeatherForecast);
router.get('/convert', convertCurrency);

export default router;