import axios from 'axios';
import bcrypt from 'bcrypt';
import User from '../models/user.js'; // Adjust path as necessary
import upload from '../middlewares/multer.js'; // Import the Multer middleware
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const AMBEEDATA_API_KEY = process.env.AMBEEDATA_API_KEY;

export const getWeatherByUserLocation = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Fetch the user to get the location coordinates
      const user = await User.findById(userId);
      if (!user || !user.location || !user.location.coordinates) {
        return res.status(404).json({ error: 'User or location not found' });
      }
  
      const [lat, lng] = user.location.coordinates;
  
      // Call AmbeeData API
      const response = await axios.get(`https://api.ambeedata.com/latest/by-lat-lng?lat=${lat}&lng=${lng}`, {
        headers: {
          'x-api-key': AMBEEDATA_API_KEY
        }
      });
  
      res.status(200).json(response.data);
    } catch (error) {
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

