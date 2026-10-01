import { Router } from 'express';
import {
  triageRequest,
  instantAnswer,
  checkDuplicate,
  generateDraftReply,
  summarizeThread,
  getManagerInsights,
  getKnowledgeGaps,
  getAiLogs
} from '../controllers/ai.controller.js';
import { verifyAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyAuth);

// 3.1 Smart Triage (available to all authenticated users)
router.post('/triage', triageRequest);

// 3.2 Instant Answer / RAG
router.post('/instant-answer', instantAnswer);

// 3.3 Duplicate Detection
router.post('/duplicate-check', checkDuplicate);

// 3.4 Agent Draft Reply
router.post('/draft-reply', requireRole('agent', 'admin'), generateDraftReply);

// 3.5 Thread Summarization
router.post('/summarize', requireRole('agent', 'admin'), summarizeThread);

// 3.6 Manager AI Insights
router.get('/manager-insights', requireRole('agent', 'admin'), getManagerInsights);

// 3.7 Knowledge Gap Finder
router.get('/knowledge-gaps', requireRole('agent', 'admin'), getKnowledgeGaps);

// 3.8 AI Logs / Transparency
router.get('/logs', requireRole('agent', 'admin'), getAiLogs);

export default router;
