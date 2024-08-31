import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const hospitalSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    services: {
        emergency: {
            type: Boolean,
            required: true,
        },
        care: {
            type: Boolean,
            required: true,
        },
        facilities: {
            type: Boolean,
            required: true,
        }
    },
    contactNumber: {
        type: String,
        required: true,
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Hospital = model('Hospital', hospitalSchema);

export default Hospital;
