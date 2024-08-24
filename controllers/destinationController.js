const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const UNSPLASH_ACCESS_KEY = 'Z7OgKkExWQBJeajakKWQaBReFbZw84EaXzVpzgoNaDI';
import { promisify } from 'util';
const accessAsync = promisify(fs.access);
import fs from 'fs';
import axios  from "axios";

import { Buffer } from 'buffer';

// Controller function to fetch images
export async function getImages(req, res) {
    const { query } = req.params;

    try {
        // Fetch images from Unsplash
        const response = await axios.get(UNSPLASH_API_URL, {
            params: {
                query: query,
                client_id: UNSPLASH_ACCESS_KEY
            }
        });

        // Log the entire response for debugging
        console.log('Unsplash API Response:', response.data);

        // Check if response contains 'results' and it's an array
        if (Array.isArray(response.data.results)) {
            // Extract image URLs from response data
            const images = response.data.results.map(result => ({
                raw: result.urls.raw,
                full: result.urls.full,
            }));

            // Return the images data
            return res.json({ images });
        } else {
            return res.status(500).json({ error: 'Unexpected response structure' });
        }
    } catch (error) {
        console.error('Error fetching images:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching images' });
    }

}


export async function getUserImages(req, res) {
  // Retrieve URLs from the query string and split them into an array
  const urls = req.query.urls ? req.query.urls.split(',') : [];

  // Validate the URLs array
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Invalid input, expected an array of URLs' });
  }

  try {
    // Fetch images from the provided URLs
    const imagePromises = urls.map(async (url) => {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        // Send image data as file
        res.writeHead(200, {
          'Content-Type': response.headers['content-type'],
          'Content-Disposition': `attachment; filename="${url.split('/').pop()}"`
        });
        res.end(response.data, 'binary');
      } catch (error) {
        console.error(`Error fetching image from URL: ${url}`, error.message);
        res.status(500).json({ error: 'Failed to fetch image' });
      }
    });

    // Wait for all images to be processed
    await Promise.all(imagePromises);
  } catch (error) {
    console.error('Error fetching images:', error.message);
    return res.status(500).json({ error: 'An error occurred while fetching images' });
  }
}