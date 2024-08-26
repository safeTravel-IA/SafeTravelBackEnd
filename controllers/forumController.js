import ForumPost from '../models/forum.js';
import Destination from '../models/destination.js';
import User from '../models/user.js';
import upload from '../middlewares/multer.js'
import multer from 'multer'; // Add this line

export const createForumPost = async (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific error
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // General error
            return res.status(400).json({ message: err.message });
        }

        try {
            const { userId, destinationId, title, content, hashtags } = req.body;
            const image = req.file ? req.file.path : null;

            // Check if user and destination exist
            const user = await User.findById(userId);
            const destination = await Destination.findById(destinationId);

            if (!user || !destination) {
                return res.status(404).json({ message: 'User or Destination not found' });
            }

            // Create a new forum post
            const newPost = new ForumPost({
                userId,
                destinationId,
                title,
                content,
                image,
                hashtags
            });

            // Save the post to the database
            await newPost.save();
            res.status(201).json(newPost);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

// Get all forum posts
export const getAllForumPosts = async (req, res) => {
    try {
        const posts = await ForumPost.find().populate('userId', 'username').populate('destinationId', 'name');
        res.status(200).json(posts);
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
