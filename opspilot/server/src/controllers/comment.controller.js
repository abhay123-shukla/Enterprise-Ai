import { Comment } from '../models/Comment.js';
import { Request } from '../models/Request.js';

export const getComments = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const comments = await Comment.find({ request: requestId })
      .sort({ createdAt: 1 })
      .populate('author', 'name email role avatar department');

    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { content, isInternal = false } = req.body;
    const userId = req.user._id || req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const comment = await Comment.create({
      request: requestId,
      author: userId,
      content: content.trim(),
      isInternal: Boolean(isInternal)
    });

    const populated = await Comment.findById(comment._id || comment.id).populate(
      'author',
      'name email role avatar department'
    );

    res.status(201).json({
      message: 'Comment added successfully',
      comment: populated
    });
  } catch (error) {
    next(error);
  }
};
