import Planning from '../models/plan.js';
import Destination from '../models/destination.js';

// Function to create a new planning entry
export const createPlanning = async (req, res) => {
  const { destinationId, startDate, endDate, userId } = req.body;

  try {
    // Validate input
    if (!destinationId || !startDate || !endDate || !userId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    // Create the new planning entry
    const planning = new Planning({
      destination: destinationId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userId: userId, // Save the userId in the Planning entry
    });

    await planning.save();

    // Optionally, you might want to return the newly created planning entry with more details
    const savedPlanning = await Planning.findById(planning._id).populate('destination');

    res.status(201).json(savedPlanning);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
