import mongoose from 'mongoose';
import { commentSchema } from '../models/comment.js'; // Adjust the path as necessary
import { reviewSchema } from '../models/review.js';   // Adjust the path as necessary

// Define the schema for the ForumPost model
const forumPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String, // Stores the file path or URL of the image
  },
  hashtags: [{
    type: String // Array of hashtags
  }],
  likes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema], // Reference the schema for comments
  reviews: [reviewSchema], // Reference the schema for reviews
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create the ForumPost model
const ForumPost = mongoose.model('ForumPost', forumPostSchema);

export default ForumPost;
