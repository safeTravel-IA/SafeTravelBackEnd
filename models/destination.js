import mongoose from 'mongoose';

// Define the schema for the Destination model
const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Ensure each destination name is unique
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'] // Specify that this is a point type for geospatial queries
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  category: {
    type: String,
    enum: ['City', 'Nature', 'Historical', 'Cultural', 'Other'], // Categories for destinations
    default: 'Other'
  },
  image: {
    type: String, // URL or path to the image file
    required: false // Optional field
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure location field is indexed for geospatial queries
destinationSchema.index({ location: '2dsphere' });

// Create the Destination model
const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;
