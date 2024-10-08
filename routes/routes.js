import express from 'express';

import { getLocationLogLat,getWeatherAlertByLocation } from '../controllers/weatherController.js';
import { getImages,getUserImages,listAllDestinations } from '../controllers/destinationController.js'; // Adjust the path as necessary
import { getWeatherByIp,signup,signin,updateUserLocation,getProfile,getUserImage,shareLocationWithFriends, acceptFriend, listFriends, addFriend,listAllUsernames, getMessagesByUserId } from '../controllers/userController.js';
import { convertCurrency } from '../controllers/convertionController.js';
import { getGeolocation} from '../controllers/locationController.js';
import { createForumPost,getAllForumPosts,getForumPostById,updateForumPost,deleteForumPost,toggleLike,showAllLikes,addComment,listComments } from '../controllers/forumController.js';
import { createPlanning } from '../controllers/planningController.js';
import upload from '../middlewares/multer.js';
import { translateController} from '../controllers/translationController.js';
import { getAllHospitals, getHospitalById, listHospitalsByName } from '../controllers/hospitalController.js';
const router = express.Router();
router.get('/geolocation', getGeolocation);
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/weather/getByIp', getWeatherByIp);
router.get('/forecast/:location', getLocationLogLat);
router.get('/about/images/:query', getImages);
router.get('/convertion/convert', convertCurrency);
router.post('/updateUserLocation', updateUserLocation);
router.get('/profile/:userId', getProfile);
router.get('/image/:imageName', getUserImage);
router.get('/user/images', getUserImages);
router.post('/weather/alerts', getWeatherAlertByLocation);
router.get('/destination/list', listAllDestinations);
router.post('/forum/create', createForumPost);

router.post('/forum/create', createForumPost);
// Route for getting all forum posts
router.get('/forum/getA', getAllForumPosts);    
router.delete('/forum/:id', deleteForumPost);
// Route for getting a single forum post by ID
router.get('/forum/:id', getForumPostById);

// Route for updating a forum post with image upload


router.put('/forum/:id', updateForumPost);
router.post('/plannings', createPlanning);
router.post('/translate', translateController);

// Route for deleting a forum post

router.post('/accept-friend', acceptFriend);

router.post('/add-friend', addFriend);

router.get('/list-friends', listFriends);
router.get('/users', listAllUsernames);

router.get('/messages/:userId', getMessagesByUserId);
router.get('/hospitals', getAllHospitals);
router.get('/hospital/:id', getHospitalById);
router.post('/list-hospitals-by-name', listHospitalsByName);

router.post('/share-location',shareLocationWithFriends);
router.post('/posts/toggleLike', toggleLike);

router.get('/posts/:postId/likes', showAllLikes);


router.post('/posts/:postId/comments', addComment);

router.get('/posts/:postId/comments', listComments);

export default router;