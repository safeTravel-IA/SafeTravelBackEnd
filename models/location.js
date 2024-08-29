import mongoose from 'mongoose';

// Define the schema for the Location model
const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  message: {
    type: String,
    default: null
  },
  sharedAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Location model
const Location = mongoose.model('Location', locationSchema);

export default Location;
