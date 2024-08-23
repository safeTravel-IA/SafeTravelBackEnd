import axios from 'axios';

export async function getGeolocation(req, res) {
    try {
      const response = await axios.get('https://ipinfo.io/json?token=6622745470134a');
      const loc = response.data.loc.split(',');
      const latitude = loc[0];
      const longitude = loc[1];
  
      res.json({ latitude, longitude });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve geolocation' });
    }
  }