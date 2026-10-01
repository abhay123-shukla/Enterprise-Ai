import mongoose from 'mongoose';
import { memoryDb } from './store.js';

const requestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    department: {
      type: String,
      enum: ['IT', 'HR', 'Finance', 'Facilities', 'Procurement', 'General'],
      default: 'General'
    },
    category: { type: String, default: 'General' },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical', 'low', 'medium', 'high', 'critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['open', 'pending', 'resolved', 'closed'],
      default: 'open'
    },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Frustrated', 'Urgent', 'positive', 'neutral', 'frustrated', 'urgent'],
      default: 'Neutral'
    },
    suggestedAnswer: { type: String, default: '' },
    tags: [{ type: String }],
    summary: { type: String, default: '' },
    suggestedDueDate: { type: Date },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
    duplicateReasoning: { type: String, default: '' },
    aiTriage: {
      department: String,
      category: String,
      priority: String,
      sentiment: String,
      title: String,
      summary: String,
      tags: [String],
      suggestedDueDate: String,
      confidence: { type: Number, default: 0.9 },
      reasoning: String
    },
    aiSummary: { type: String, default: '' },
    suggestedDraftReply: { type: String, default: '' },
    slaDeadline: { type: Date },
    resolvedAt: { type: Date, default: null },
    isDeflected: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const MongooseRequest = mongoose.models.Request || mongoose.model('Request', requestSchema);

const RequestProxy = new Proxy(MongooseRequest, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in memoryDb.Request) {
      return typeof memoryDb.Request[prop] === 'function'
        ? memoryDb.Request[prop].bind(memoryDb.Request)
        : memoryDb.Request[prop];
    }
    return target[prop];
  }
});

export const Request = RequestProxy;
export default Request;
