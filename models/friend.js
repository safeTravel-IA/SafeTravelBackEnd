import mongoose from 'mongoose';

// Define the schema for the Friend model
const friendSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  friend: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure user and friend are unique pairs to avoid duplicate entries
friendSchema.index({ user: 1, friend: 1 }, { unique: true });

// Create the Friend model
const Friend = mongoose.model('Friend', friendSchema);

export default Friend;
