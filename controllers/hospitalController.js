import Hospital from "../models/hospital.js";
import mongoose from "mongoose";
export const getAllHospitals = async (req, res) => {
    try {
      const hospitals = await Hospital.find({});
      res.status(200).json(hospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
  };
  
  // Fetch a hospital by ID
  export const getHospitalById = async (req, res) => {
    const { id } = req.params;
  
    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid hospital ID' });
    }
  
    try {
      const hospital = await Hospital.findById(id);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
      res.status(200).json(hospital);
    } catch (error) {
      console.error('Error fetching hospital:', error);
      res.status(500).json({ error: 'Failed to fetch hospital' });
    }
  };
  export const listHospitalsByName = async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
  
    try {
      const hospitals = await Hospital.find({
        name: { $regex: name, $options: 'i' } // Case-insensitive search
      });
  
      res.status(200).json(hospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
  };