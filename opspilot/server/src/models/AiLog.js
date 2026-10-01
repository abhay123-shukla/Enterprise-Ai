import mongoose from 'mongoose';
import { memoryDb } from './store.js';

const aiLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        'triage',
        'suggest_answer',
        'draft_reply',
        'summarize',
        'analytics',
        'duplicate_check',
        'manager_insights',
        'knowledge_gaps'
      ],
      required: true
    },
    input: { type: String, required: true },
    output: { type: mongoose.Schema.Types.Mixed, required: true },
    tokensUsed: { type: Number, default: 0 },
    responseTimeMs: { type: Number, default: 0 },
    model: { type: String, default: 'gemini-1.5-flash' },
    status: { type: String, enum: ['success', 'fallback', 'error'], default: 'success' },
    confidence: { type: Number, default: 1.0 },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

const MongooseAiLog = mongoose.models.AiLog || mongoose.model('AiLog', aiLogSchema);

const AiLogProxy = new Proxy(MongooseAiLog, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in memoryDb.AiLog) {
      return typeof memoryDb.AiLog[prop] === 'function'
        ? memoryDb.AiLog[prop].bind(memoryDb.AiLog)
        : memoryDb.AiLog[prop];
    }
    return target[prop];
  }
});

export const AiLog = AiLogProxy;
export default AiLog;
