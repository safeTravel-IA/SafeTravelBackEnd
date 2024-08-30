import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Natural Disaster', 'Civil Disturbance', 'Other'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

alertSchema.index({ location: '2dsphere' });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
