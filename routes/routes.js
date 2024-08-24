import express from 'express';

import { getLocationLogLat,getWeatherAlertByLocation } from '../controllers/weatherController.js';
import { getImages,getUserImages} from '../controllers/destinationController.js'; // Adjust the path as necessary
import { getWeatherByIp,signup,signin,updateUserLocation,getProfile,getUserImage } from '../controllers/userController.js';
import { convertCurrency } from '../controllers/convertionController.js';
import { getGeolocation } from '../controllers/locationController.js';

const router = express.Router();
router.get('/geolocation', getGeolocation);
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/weather/getByIp', getWeatherByIp);
router.get('/:location', getLocationLogLat);
router.get('/about/images/:query', getImages);
router.get('/convert', convertCurrency);
router.post('/updateUserLocation', updateUserLocation);
router.get('/profile/:userId', getProfile);
router.get('/image/:imageName', getUserImage);
router.get('/user/images', getUserImages);
router.get('/weather/alerts', getWeatherAlertByLocation);

export default router;