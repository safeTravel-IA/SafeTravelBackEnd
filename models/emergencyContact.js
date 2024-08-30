import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Hospital', 'Embassy', 'Police', 'Other'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  address: {
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
  }
});

emergencyContactSchema.index({ location: '2dsphere' });

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

export default EmergencyContact;
