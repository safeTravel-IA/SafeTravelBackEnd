import ForumPost from '../models/forum.js';
import Destination from '../models/destination.js';
import User from '../models/user.js';
import upload from '../middlewares/multer.js'
import Comment from '../models/comment.js';
import multer from 'multer'; // Add this line
import moment from 'moment';  // Import moment.js for date manipulation
import mongoose from 'mongoose';
export const createForumPost = async (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { userId, destinationId, title, content, hashtags } = req.body;
            let image = req.file ? req.file.path : null;

            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(destinationId)) {
                return res.status(400).json({ message: 'Invalid User or Destination ID' });
            }

            // Remove '/uploads' from image path if it exists
            if (image) {
                image = image.replace(/^uploads\//, '');
            }

            console.log('Request body:', req.body);

            // Query the Destination
            const destination = await Destination.findById(destinationId).exec();
            console.log('Destination Query ID:', destinationId);
            console.log('Destination Result:', destination);

            if (!destination) {
                return res.status(404).json({ message: 'Destination not found' });
            }

            const user = await User.findById(userId).exec();
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const newPost = new ForumPost({
                userId,
                destinationId,
                title,
                content,
                image,
                hashtags
            });

            await newPost.save();
            res.status(201).json(newPost);
        } catch (error) {
            console.error('Error:', error); // Log the full error
            res.status(500).json({ message: error.message });
        }
    });
};


// Get all forum posts
export const getAllForumPosts = async (req, res) => {
    try {
        // Find all posts and populate 'username' from userId and 'name' from destinationId
        const posts = await ForumPost.find()
            .populate('userId', 'username')
            .populate('destinationId', 'name');  // Ensure 'destinationId' is populated with 'name'

        // Modify the response to include additional fields like timeAgo, userId, and _id
        const modifiedPosts = posts.map(post => {
            const postDate = moment(post.createdAt);
            const now = moment();

            // Calculate the time difference in various units
            const minutesAgo = now.diff(postDate, 'minutes');
            const hoursAgo = now.diff(postDate, 'hours');
            const daysAgo = now.diff(postDate, 'days');

            // Determine the most appropriate unit for time ago
            let timeAgo;
            if (minutesAgo < 60) {
                timeAgo = `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
            } else if (hoursAgo < 24) {
                timeAgo = `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
            } else {
                timeAgo = `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
            }

            return {
                _id: post._id,  // ForumPost ID
                userId: post.userId._id,  // userId as a direct field
                userName: post.userId.username,  // username as a direct field
                destinationId: post.destinationId._id,  // destinationId as a direct field
                destinationName: post.destinationId.name,  // destination name as a direct field
                timeAgo: timeAgo,  // Time since the post was created in a human-readable format
                image: post.image ? post.image.replace('/uploads', '') : '', // Remove '/uploads' from image field
                ...post.toObject(),  // Spread the rest of the post object
            };
        });

        // Send the modified response
        res.status(200).json(modifiedPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getForumPostById = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id).populate('userId', 'username').populate('destinationId', 'name');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a forum post
export const updateForumPost = async (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { title, content } = req.body;
            const image = req.file ? req.file.path : null;

            // Find the post by ID and update it
            const updatedFields = { title, content, updatedAt: Date.now() };
            if (image) updatedFields.image = image;

            const post = await ForumPost.findByIdAndUpdate(
                req.params.id,
                updatedFields,
                { new: true }
            );

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            res.status(200).json(post);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};


// Delete a forum post
export const deleteForumPost = async (req, res) => {
    try {
        const post = await ForumPost.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const toggleLike = async (req, res) => {
    try {
      const { postId, userId } = req.body;
  
      // Log incoming request data for debugging
      console.log("Received request to toggle like with postId:", postId, "and userId:", userId);
  
      // Find the post by ID
      const post = await ForumPost.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Check if the post is already liked by the user (assuming we receive this info from the request)
      const isLiked = req.body.isLiked; // Assume this is a boolean indicating current like status
  
      // Toggle like count
      if (isLiked) {
        post.likes -= 1; // Unlike the post
      } else {
        post.likes += 1; // Like the post
      }
  
      // Ensure likes count does not go below zero
      post.likes = Math.max(0, post.likes);
  
      // Save the updated post document
      await post.save();
      console.log("Post successfully updated with new like count:", post.likes);
  
      // Return the updated post
      res.status(200).json(post);
    } catch (error) {
      console.error("Error occurred while toggling like:", error); // Log the error details
      res.status(500).json({ error: 'An error occurred while toggling like' });
    }
  };
  
  
  
  // Show all likes
  export const showAllLikes = async (req, res) => {
    try {
      const { postId } = req.params;
  
      // Find the post by ID
      const post = await ForumPost.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Return the number of likes
      res.status(200).json({ likes: post.likes });
    } catch (error) {
      console.error("Error occurred while fetching likes:", error); // Log the error for debugging
      res.status(500).json({ error: 'An error occurred while fetching likes' });
    }
  };
  
  
  // Add a comment
  export const addComment = async (req, res) => {
    try {
      const { postId, userId, content } = req.body;
  
      const post = await ForumPost.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      const comment = new Comment({
        userId,
        content
      });
  
      post.comments.push(comment);
      await comment.save();
      await post.save();
  
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while adding a comment' });
    }
  };
  
  // List comments
  export const listComments = async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await ForumPost.findById(postId).populate('comments.userId', 'username'); // Assuming 'comments' contains user references
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Extract only the content field from each comment
      const commentsContent = post.comments.map(comment => ({
        content: comment.content
      }));
  
      res.status(200).json(commentsContent);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while listing comments' });
    }
  };
  