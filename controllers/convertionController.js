
import fetch from 'node-fetch';

const API_KEY = '5b1c0409ff-215057ddd9-sikz1f'; // Replace with your API key
const BASE_URL = 'https://api.fastforex.io';

export const convertCurrency = async (req, res) => {
    try {
      const { amount, from, to } = req.query;
  
      // Validate inputs
      if (!amount || !from || !to) {
        return res.status(400).json({ error: 'Amount, from currency, and to currency are required' });
      }
  
      // Validate amount
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
  
      // Fetch conversion rate for 1 unit
      const url = `${BASE_URL}/convert?from=${from}&to=${to}&amount=1&api_key=${API_KEY}`;
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (!data || !data.result || !data.result[to]) {
        return res.status(400).json({ error: 'Conversion rate not available for the given currencies' });
      }
  
      // Calculate converted amount
      const rate = data.result[to];
      const convertedAmount = rate * amountNumber;
  
      // Return result
      res.json({
        from,
        to,
        rate,
        amount: amountNumber,
        convertedAmount
      });
    } catch (error) {
      console.error('Error converting currency:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };