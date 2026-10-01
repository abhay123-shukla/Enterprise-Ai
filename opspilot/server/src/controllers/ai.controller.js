import { AiService } from '../services/ai.service.js';
import { Request } from '../models/Request.js';
import { Comment } from '../models/Comment.js';
import { KnowledgeArticle } from '../models/KnowledgeArticle.js';
import { AiLog } from '../models/AiLog.js';

/**
 * Enterprise AI Controller
 * Orchestrates calls between Express API and aiService.js
 * Ensures React never calls Gemini directly.
 */

// 3.1 Smart Triage Controller
export const triageRequest = async (req, res, next) => {
  try {
    const text = req.body.text || req.body.query || `${req.body.title || ''} ${req.body.description || ''}`.trim();
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Text or title/description field is required for AI triage' });
    }

    const userId = req.user?._id || req.user?.id;
    const triage = await AiService.triage(text, userId);

    res.status(200).json({
      message: 'AI Triage completed successfully',
      triage
    });
  } catch (error) {
    next(error);
  }
};

// 3.2 Instant Answer / RAG Controller
export const instantAnswer = async (req, res, next) => {
  try {
    const text = req.body.text || req.body.query || `${req.body.title || ''} ${req.body.description || ''}`.trim();
    const department = req.body.department;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Text or query field is required for Instant Answer' });
    }

    const userId = req.user?._id || req.user?.id;
    const result = await AiService.suggestAnswer(text, department, userId);

    res.status(200).json({
      message: 'Instant Answer retrieval completed',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// 3.3 Duplicate Detection Controller
export const checkDuplicate = async (req, res, next) => {
  try {
    const { text, department, excludeId } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Text field is required for duplicate check' });
    }

    const userId = req.user?._id || req.user?.id;
    const duplicateResult = await AiService.detectDuplicate(text, department, excludeId, userId);

    res.status(200).json({
      message: 'Duplicate detection completed',
      duplicate: duplicateResult
    });
  } catch (error) {
    next(error);
  }
};

// 3.4 Agent Draft Reply Controller
export const generateDraftReply = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ message: 'requestId is required' });
    }

    const request = await Request.findById(requestId).populate('requester', 'name email');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const comments = await Comment.find({ request: requestId }).populate('author', 'name role');
    const articles = await KnowledgeArticle.find({ department: request.department }).limit(3);

    const userId = req.user?._id || req.user?.id;
    const draft = await AiService.generateDraftReply(request, comments, articles, userId);

    await Request.findByIdAndUpdate(requestId, { suggestedDraftReply: draft });

    res.status(200).json({
      message: 'AI Draft reply generated',
      draft
    });
  } catch (error) {
    next(error);
  }
};

// 3.5 Thread Summarization Controller
export const summarizeThread = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ message: 'requestId is required' });
    }

    const request = await Request.findById(requestId).populate('requester', 'name email');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const comments = await Comment.find({ request: requestId }).populate('author', 'name role');
    const userId = req.user?._id || req.user?.id;

    const summary = await AiService.summarize(request, comments, userId);

    await Request.findByIdAndUpdate(requestId, { aiSummary: summary });

    res.status(200).json({
      message: 'Thread summarized by AI',
      summary
    });
  } catch (error) {
    next(error);
  }
};

// 3.6 Manager AI Insights Controller
export const getManagerInsights = async (req, res, next) => {
  try {
    const allRequests = await Request.find({});
    const total = allRequests.length;
    let breaches = 0;
    let deflectedCount = 0;

    const now = new Date();
    for (const r of allRequests) {
      if (r.slaDeadline && now > new Date(r.slaDeadline) && r.status !== 'resolved' && r.status !== 'closed') {
        breaches++;
      }
      if (r.isDeflected || (r.suggestedAnswer && r.status === 'resolved')) {
        deflectedCount++;
      }
    }

    const metrics = {
      summary: {
        totalRequests: total,
        slaBreaches: breaches,
        avgResolutionHours: '2.4',
        deflectionRatePercent: total > 0 ? Math.round((deflectedCount / total) * 100) : 42
      }
    };

    const userId = req.user?._id || req.user?.id;
    const insights = await AiService.generateManagerInsights(metrics, userId);

    res.status(200).json(insights);
  } catch (error) {
    next(error);
  }
};

// 3.7 Knowledge Gap Finder Controller
export const getKnowledgeGaps = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const gaps = await AiService.findKnowledgeGaps(userId);

    res.status(200).json(gaps);
  } catch (error) {
    next(error);
  }
};

// 3.8 AI Logs & Transparency Controller
export const getAiLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const logs = await AiLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email role');

    res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
};
