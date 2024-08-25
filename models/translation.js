import mongoose from 'mongoose';
const translationSchema = new mongoose.Schema({
    inputText: {
        type: String,
        required: true
    },
    outputText: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Reference to the User model
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Translation = mongoose.model('Translation', translationSchema);

export default Translation;
