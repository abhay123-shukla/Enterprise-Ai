import { z } from 'zod';

/**
 * Zod Schemas for Enterprise AI Pipeline
 * Fulfills Specification 3.8 (AI response validation)
 */

// 3.1 Smart Triage Schema
export const triageOutputSchema = z.object({
  department: z.enum(['IT', 'HR', 'Finance', 'Facilities', 'Procurement', 'General']),
  category: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical', 'Low', 'Medium', 'High', 'Critical']),
  sentiment: z.enum(['positive', 'neutral', 'frustrated', 'urgent', 'Positive', 'Neutral', 'Frustrated', 'Urgent']),
  title: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
  suggestedDueDate: z.string()
});

// 3.2 Instant Answer / RAG Schema
export const ragOutputSchema = z.object({
  answer: z.string().min(1),
  confidence: z.number().min(0).max(1),
  isDeflected: z.boolean(),
  matchedArticleTitles: z.array(z.string()).default([]),
  groundingContext: z.string().optional()
});

// 3.3 Duplicate Detection Schema
export const duplicateDetectionSchema = z.object({
  isDuplicate: z.boolean(),
  duplicateOf: z.string().nullable(),
  similarityScore: z.number().min(0).max(1),
  reasoning: z.string().min(1)
});

// 3.4 Agent Draft Reply Schema
export const draftReplyOutputSchema = z.object({
  draft: z.string().min(1),
  actionSuggestion: z.string().optional(),
  tone: z.string().optional()
});

// 3.5 Thread Summarization Schema
export const summarizeOutputSchema = z.object({
  summary: z.string().min(1),
  coreIssue: z.string().optional(),
  actionsTaken: z.string().optional(),
  nextAction: z.string().optional()
});

// 3.6 Manager AI Insights Schema
export const managerInsightsOutputSchema = z.object({
  insights: z.array(z.string()).min(4), // Requires Insight 1, 2, 3, 4
  recommendations: z.array(z.string()).min(1)
});

// 3.7 Knowledge Gap Finder Schema
export const knowledgeGapOutputSchema = z.object({
  gaps: z.array(
    z.object({
      topic: z.string(),
      queryFrequency: z.number(),
      department: z.string(),
      category: z.string(),
      suggestedTitle: z.string(),
      suggestedCategory: z.string(),
      draftedContent: z.string()
    })
  )
});
