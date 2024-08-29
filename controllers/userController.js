import axios from 'axios';
import bcrypt from 'bcrypt';
import User from '../models/user.js'; // Adjust path as necessary
import upload from '../middlewares/multer.js'; // Import the Multer middleware
import fs from 'fs';
import path from 'path';
import Friend from '../models/friend.js';
import Message from '../models/message.js';
import { fileURLToPath } from 'url';
import { io } from '../server.js';         // Import the `io` instance
import mongoose from 'mongoose';
import Location from '../models/location.js'; // Adjust the path according to your project structure

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

  console.log(`Requested image: ${imageName}`);
  console.log(`Image path resolved to: ${imagePath}`);

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
export async function shareLocationWithFriends(req, res) {
  const { userId, locationData } = req.body;

  try {
    console.log('Received userId:', userId); // Debugging line
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Create a new Location entry
    const location = new Location({
      userId,
      coordinates: locationData.coordinates,
      message: locationData.message
    });
    
    await location.save();

    // Find friends who have accepted the friend request
    const friends = await Friend.find({
      user: userId,
      status: 'accepted'
    }).populate('friend'); // Ensure friend field is populated

    if (friends.length === 0) {
      console.log('No accepted friends found.');
      return res.status(200).json({ message: 'No friends to share location with.' });
    }

    // Send location to each friend
    for (const friend of friends) {
      const friendUser = friend.friend;

      // Create a message for the friend
      const message = {
        sender: userId,
        receiver: friendUser._id,
        content: `Shared location: ${locationData.message}\nLocation: ${locationData.coordinates}`,
        sentAt: new Date()
      };

      // Save the message to the database
      await new Message(message).save();

      // Emit location message to the friend's socket
      sendMessageToFriend(friendUser.socketId, message);

      // If the friend has a socketId, send the same message back to the sender (optional)
      if (friendUser.socketId) {
        const reverseMessage = {
          sender: friendUser._id,
          receiver: userId,
          content: `Received location: ${locationData.message}\nLocation: ${locationData.coordinates}`,
          sentAt: new Date()
        };

        await new Message(reverseMessage).save();
        sendMessageToFriend(friendUser.socketId, reverseMessage);
      }
    }

    console.log('Location shared with friends.');
    res.status(200).json({ message: 'Location shared with friends.' });
  } catch (error) {
    console.error('Error sharing location with friends:', error);
    res.status(500).json({ error: error.message });
  }
}


function sendMessageToFriend(friendSocketId, message) {
  if (friendSocketId) {
    io.to(friendSocketId).emit('receive_message', message);
  } else {
    console.error('Friend socket ID is not defined');
  }
}

export async function acceptFriend(req, res) {
  const { userId, friendId } = req.body;

  try {
    // Update the friend request from friendId to userId
    const friendRequestFromFriend = await Friend.findOneAndUpdate(
      { user: friendId, friend: userId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    // Update the friend request from userId to friendId
    const friendRequestFromUser = await Friend.findOneAndUpdate(
      { user: userId, friend: friendId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    // Check if either of the friend requests was not found
    if (!friendRequestFromFriend && !friendRequestFromUser) {
      return res.status(404).json({ error: 'Friend request not found or already accepted' });
    }

    console.log('Friend request accepted for both directions.');
    res.status(200).json({ message: 'Friend request accepted for both directions.' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function listFriends(req, res) {
  const { userId } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const friends = await Friend.find({ user: userId, status: 'accepted' }).populate('friend');
    
    if (friends.length === 0) {
      console.log('No friends found.');
      return res.status(200).json([]);
    }

    const friendList = friends.map(friend => friend.friend);
    res.status(200).json(friendList);
  } catch (error) {
    console.error('Error listing friends:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function addFriend(req, res) {
  const { userId, friendId } = req.body;

  try {
    // Check if the friendship already exists
    const existingFriendship = await Friend.findOne({ user: userId, friend: friendId });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Friendship already exists.' });
    }

    // Create a new Friend request
    const friendRequest = new Friend({
      user: userId,
      friend: friendId,
      status: 'pending',
    });
    await friendRequest.save();

    console.log('Friend request sent.');
    res.status(200).json({ message: 'Friend request sent.' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: error.message });
  }
}

export const listAllUsernames = async (req, res) => {
  try {
    // Get the current user ID from the request (e.g., from query parameters)
    const { currentUserId } = req.query;

    if (!currentUserId) {
      return res.status(400).json({ error: 'Current user ID is required' });
    }

    // Fetch all users from the database, including 'username' and '_id'
    const users = await User.find({ _id: { $ne: currentUserId } }, '_id username address');

    // Map users to extract id and username
    const userDetails = users.map(user => ({
      id: user._id,
      username: user.username,
      location:user.address
    }));

    // Send the list of user details in the response
    res.json(userDetails);
  } catch (error) {
    // Handle errors and send a 500 response
    res.status(500).json({ error: error.message });
  }
};
