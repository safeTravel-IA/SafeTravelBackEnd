const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const UNSPLASH_ACCESS_KEY = 'Z7OgKkExWQBJeajakKWQaBReFbZw84EaXzVpzgoNaDI';
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
  
      // Return the images data
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching images' });
    }
  }