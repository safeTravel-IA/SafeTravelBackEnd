import mongoose from 'mongoose';

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String, // Stores the file path to the profile picture
    default: null // Optional field, default to null if not provided
  },
  emergencyContacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyContact'
  }],
  preferences: {
    type: Map,
    of: String // This could be used for user-specific settings
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0] // Default to a neutral point
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure the location field is indexed for geospatial queries
userSchema.index({ location: '2dsphere' });

// Create the User model
const User = mongoose.model('User', userSchema);

export default User;
