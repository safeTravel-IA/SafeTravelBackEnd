import ForumPost from '../models/forum.js';
import Destination from '../models/destination.js';
import User from '../models/user.js';
import upload from '../middlewares/multer.js'
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
        // Find all posts and populate only 'username' from userId and 'name' from destinationId
        const posts = await ForumPost.find()
            .populate('userId', 'username')
            .populate('destinationId', 'name');

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
