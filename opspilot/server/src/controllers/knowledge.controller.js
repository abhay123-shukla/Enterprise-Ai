import { KnowledgeArticle } from '../models/KnowledgeArticle.js';

export const getArticles = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const filter = {};

    if (department && department !== 'all') {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const articles = await KnowledgeArticle.find(filter)
      .sort({ viewCount: -1, createdAt: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({ articles });
  } catch (error) {
    next(error);
  }
};

export const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await KnowledgeArticle.findById(id).populate('createdBy', 'name email');

    if (!article) {
      return res.status(404).json({ message: 'Knowledge article not found' });
    }

    // Increment view count
    await KnowledgeArticle.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    res.status(200).json({ article });
  } catch (error) {
    next(error);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const { title, content, department = 'IT', category = 'General', tags = [] } = req.body;
    const userId = req.user._id || req.user.id;

    const article = await KnowledgeArticle.create({
      title,
      content,
      department,
      category,
      tags,
      createdBy: userId
    });

    res.status(201).json({
      message: 'Knowledge article created successfully',
      article
    });
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, department, category, tags } = req.body;

    const updated = await KnowledgeArticle.findByIdAndUpdate(
      id,
      { title, content, department, category, tags },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Knowledge article not found' });
    }

    res.status(200).json({
      message: 'Knowledge article updated successfully',
      article: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await KnowledgeArticle.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Knowledge article not found' });
    }

    res.status(200).json({ message: 'Knowledge article deleted successfully' });
  } catch (error) {
    next(error);
  }
};
