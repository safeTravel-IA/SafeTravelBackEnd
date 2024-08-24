import axios from 'axios';
import bcrypt from 'bcrypt';
import User from '../models/user.js'; // Adjust path as necessary
import upload from '../middlewares/multer.js'; // Import the Multer middleware
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const API_KEY="5d7c47358580d0c767a2650745ac920f272ec422258c1c45270070c41b7f3ee7"
const GEOLOCATION_API_URL = 'https://ipinfo.io/json?token=6622745470134a'; // Example URL

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const AMBEEDATA_API_KEY = API_KEY;

export const getWeatherByIp = async (req, res) => {
  try {
      // Get the client's IP address from the request header
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if (!ipAddress) {
          return res.status(400).json({ error: 'IP address not found' });
      }
      
      // Fetch geolocation data from the IP address
      const geoResponse = await axios.get(GEOLOCATION_API_URL);
      const loc = geoResponse.data.loc.split(',');
      const latitude = loc[0];
      const longitude = loc[1];
      
      if (!latitude || !longitude) {
          return res.status(404).json({ error: 'Could not determine coordinates from IP address' });
      }
      
      // Call AmbeeData API to fetch weather data
      const weatherResponse = await axios.get(`https://api.ambeedata.com/latest/by-lat-lng?lat=${latitude}&lng=${longitude}`, {
          headers: {
              'x-api-key': AMBEEDATA_API_KEY
          }
      });
      
      res.status(200).json(weatherResponse.data);
  } catch (error) {
      console.error('Error fetching weather data:', error.message); // Detailed logging
      res.status(500).json({ error: 'Failed to fetch weather data' });
  }
};


// Update user location
export const updateUserLocation = async (req, res) => {
  try {
    const { userId, coordinates } = req.body;

    // Validate the coordinates
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Update user's location
    const user = await User.findByIdAndUpdate(userId, {
      location: {
        type: 'Point',
        coordinates
      }
    }, { new: true });

    res.status(200).json({ message: 'Location updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
};

export const getUserImage = (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, '..', 'uploads', imageName);

  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`Image not found: ${imagePath}`);
      return res.status(404).json({ error: 'Image not found' });
    }
    res.sendFile(imagePath);
  });
};

// Signup Controller
export const signup = async (req, res) => {
  upload.single('profilePicture')(req, res, async (err) => {
    if (err) {
      console.log('File upload error:', err);
      console.log('Uploaded file:', req.file);
      return res.status(400).json({ message: 'Error uploading profile picture', error: err.message });
    }

    const { username, password, firstName, lastName, phoneNumber, address } = req.body;

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        address,
        profilePicture: req.file ? req.file.path : null,
      });

      await newUser.save();

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
  });
};


// Fetch User Profile Controller
export const getProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Optionally, you can exclude sensitive fields like password
    const { password, ...userProfile } = user.toObject();
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
};


// Signin Controller
export const signin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Signin successful', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

