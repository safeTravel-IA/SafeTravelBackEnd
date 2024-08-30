import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  recommendations: {
    type: [String], // Array of strings for various recommendations
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

export default Recommendation;
