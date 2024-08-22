// Example schema and controller for comments
import Comment from '../models/comment.js'; // Define a comment schema similarly

export const createComment = async (req, res) => {
  try {
    const { userId, destinationId, commentText } = req.body;

    // Create a new comment
    const comment = new Comment({
      userId,
      destinationId,
      commentText
    });

    await comment.save();
    res.status(201).json({ message: 'Comment created successfully', comment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const getCommentsForDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const comments = await Comment.find({ destinationId });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
