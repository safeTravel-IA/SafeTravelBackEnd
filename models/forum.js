import mongoose from 'mongoose';

// Define the schema for the ForumPost model
const forumPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment' // Reference to the Comment model
  }],
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
