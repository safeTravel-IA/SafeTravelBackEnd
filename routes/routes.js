import express from 'express';

import { getLocationLogLat,getWeatherForecast } from '../controllers/weatherController.js';
import { getImages } from '../controllers/destinationController.js'; // Adjust the path as necessary
import { getWeatherByUserLocation,signup,signin,updateUserLocation,getProfile,getUserImage } from '../controllers/userController.js';
import { convertCurrency } from '../controllers/convertionController.js';
import { getGeolocation } from '../controllers/locationController.js';

const router = express.Router();
router.get('/geolocation', getGeolocation);
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/weather/:userId', getWeatherByUserLocation);
router.get('/:location', getLocationLogLat);
router.get('/images/:query', getImages);
router.get('/weather', getWeatherForecast);
router.get('/convert', convertCurrency);
router.post('/updateUserLocation', updateUserLocation);
router.get('/profile/:userId', getProfile);
router.get('/image/:imageName', getUserImage);

export default router;