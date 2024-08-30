import Comment from '../models/comment.js';
import ForumPost from '../models/forum.js'; // Assuming the ForumPost model is in forum.js

// Controller to add a comment to a forum post
export const createComment = async (req, res) => {
  try {
    const { userId, forumPostId, content } = req.body;

    // Create a new comment
    const comment = new Comment({
      userId,
      content
    });

    // Find the forum post by ID and push the new comment into the comments array
    const forumPost = await ForumPost.findById(forumPostId);
    if (!forumPost) {
      return res.status(404).json({ error: 'Forum post not found' });
    }

    // Add the comment to the forum post's comments array
    forumPost.comments.push(comment);
    await forumPost.save();

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};
export const getCommentsForForumPost = async (req, res) => {
  try {
    const { forumPostId } = req.params;

    // Find the forum post by ID and populate the comments array
    const forumPost = await ForumPost.findById(forumPostId).populate('comments.userId', 'name'); // Populate the user details in comments if needed
    if (!forumPost) {
      return res.status(404).json({ error: 'Forum post not found' });
    }

    res.status(200).json(forumPost.comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
