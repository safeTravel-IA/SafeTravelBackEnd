import axios from 'axios';
import User from '../models/user.js'; // Adjust path as necessary
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
