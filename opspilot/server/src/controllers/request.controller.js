import { Request } from '../models/Request.js';
import { Comment } from '../models/Comment.js';
import { KnowledgeArticle } from '../models/KnowledgeArticle.js';
import { AiService } from '../services/ai.service.js';

const getSlaHours = (priority) => {
  switch (priority) {
    case 'Critical': return 4;
    case 'High': return 8;
    case 'Medium': return 24;
    case 'Low': return 48;
    default: return 24;
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id || req.user.id;

    // 1. Run 3.1 Real-Time AI Triage
    const aiTriage = await AiService.triage(description, userId);

    // 2. Run 3.2 Search Knowledge Base for Instant Deflection Answer (RAG)
    const ragResult = await AiService.suggestAnswer(description, aiTriage.department, userId);

    // 3. Run 3.3 Duplicate Detection against recent open requests
    const duplicateCheck = await AiService.detectDuplicate(description, aiTriage.department, null, userId);

    // 4. Resolve Fields with AI Fallbacks
    const resolvedTitle = title && title.trim().length > 0 
      ? title.trim() 
      : aiTriage.title || (description.slice(0, 60) + (description.length > 60 ? '...' : ''));
    
    const department = req.body.department || aiTriage.department;
    const category = req.body.category || aiTriage.category;
    const priority = req.body.priority || aiTriage.priority;

    // 5. Calculate SLA Deadline & Due Date
    const slaHours = getSlaHours(priority);
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    const suggestedDueDate = aiTriage.suggestedDueDate ? new Date(aiTriage.suggestedDueDate) : slaDeadline;

    const newRequest = await Request.create({
      title: resolvedTitle,
      description,
      department,
      category,
      priority,
      status: 'open',
      requester: userId,
      sentiment: aiTriage.sentiment,
      suggestedAnswer: ragResult.answer,
      isDeflected: ragResult.isDeflected,
      tags: aiTriage.tags || [],
      summary: aiTriage.summary || '',
      suggestedDueDate,
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateOf: duplicateCheck.duplicateOf,
      duplicateReasoning: duplicateCheck.reasoning,
      aiTriage,
      slaDeadline
    });

    res.status(201).json({
      message: 'Request created, triaged, and analyzed by AI successfully',
      request: newRequest,
      rag: ragResult,
      duplicate: duplicateCheck
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { status, priority, department, search, page = 1, limit = 10, sort = 'createdAt' } = req.query;

    const filter = { requester: userId };

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (department && department !== 'all') filter.department = department;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Request.countDocuments(filter);
    const requests = await Request.find(filter)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('assignedTo', 'name email role department');

    res.status(200).json({
      requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRequests = async (req, res, next) => {
  try {
    const { status, priority, department, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (department && department !== 'all') filter.department = department;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Request.countDocuments(filter);
    const requests = await Request.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .populate('requester', 'name email department')
      .populate('assignedTo', 'name email role');

    res.status(200).json({
      requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id)
      .populate('requester', 'name email department avatar')
      .populate('assignedTo', 'name email department avatar')
      .populate('duplicateOf', 'title status priority department');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const comments = await Comment.find({ request: id })
      .sort({ createdAt: 1 })
      .populate('author', 'name email role avatar');

    res.status(200).json({
      request,
      comments
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, department, category } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
      }
    }
    if (priority) {
      updateData.priority = priority;
      const slaHours = getSlaHours(priority);
      updateData.slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    }
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (department) updateData.department = department;
    if (category) updateData.category = category;

    const updated = await Request.findByIdAndUpdate(id, updateData, { new: true })
      .populate('requester', 'name email department')
      .populate('assignedTo', 'name email role')
      .populate('duplicateOf', 'title status priority department');

    if (!updated) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({
      message: 'Request updated successfully',
      request: updated
    });
  } catch (error) {
    next(error);
  }
};

export const assignRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignedTo = req.body.assignedTo || req.user._id || req.user.id;

    const updated = await Request.findByIdAndUpdate(
      id,
      { assignedTo, status: 'pending' },
      { new: true }
    )
      .populate('requester', 'name email department')
      .populate('assignedTo', 'name email role');

    if (!updated) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({
      message: 'Request assigned successfully',
      request: updated
    });
  } catch (error) {
    next(error);
  }
};

export const generateDraftReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id).populate('requester', 'name email');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const comments = await Comment.find({ request: id }).populate('author', 'name role');
    const articles = await KnowledgeArticle.find({ department: request.department }).limit(3);
    const userId = req.user?._id || req.user?.id;

    const draft = await AiService.generateDraftReply(request, comments, articles, userId);

    await Request.findByIdAndUpdate(id, { suggestedDraftReply: draft });

    res.status(200).json({
      draft
    });
  } catch (error) {
    next(error);
  }
};

export const summarizeThread = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id).populate('requester', 'name email');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const comments = await Comment.find({ request: id }).populate('author', 'name role');
    const userId = req.user?._id || req.user?.id;

    const summary = await AiService.summarize(request, comments, userId);

    await Request.findByIdAndUpdate(id, { aiSummary: summary });

    res.status(200).json({
      summary
    });
  } catch (error) {
    next(error);
  }
};
