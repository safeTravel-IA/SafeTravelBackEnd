import express from 'express';

import { getLocationLogLat,getWeatherAlertByLocation } from '../controllers/weatherController.js';
import { getImages,getUserImages,listAllDestinations } from '../controllers/destinationController.js'; // Adjust the path as necessary
import { getWeatherByIp,signup,signin,updateUserLocation,getProfile,getUserImage } from '../controllers/userController.js';
import { convertCurrency } from '../controllers/convertionController.js';
import { getGeolocation } from '../controllers/locationController.js';
import { createForumPost,getAllForumPosts,getForumPostById,updateForumPost,deleteForumPost } from '../controllers/forumController.js';
import { createPlanning } from '../controllers/planningController.js';
import upload from '../middlewares/multer.js';

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
router.post('/weather/alerts', getWeatherAlertByLocation);
router.get('/destination/list', listAllDestinations);
router.post('/forum/create', createForumPost);

router.post('/forum/create', upload.single('image'), createForumPost);

// Route for getting all forum posts
router.get('/forum/getA', getAllForumPosts);

// Route for getting a single forum post by ID
router.get('/forum/:id', getForumPostById);

// Route for updating a forum post with image upload
router.put('/forum/:id', upload.single('image'), updateForumPost);
router.post('/plannings', createPlanning);

// Route for deleting a forum post
router.delete('/forum/:id', deleteForumPost);

export default router;