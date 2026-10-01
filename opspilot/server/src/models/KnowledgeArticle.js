import mongoose from 'mongoose';
import { memoryDb } from './store.js';

const knowledgeArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    department: {
      type: String,
      enum: ['IT', 'HR', 'Finance', 'Facilities', 'Procurement', 'General'],
      default: 'IT'
    },
    category: { type: String, default: 'General' },
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const MongooseKnowledgeArticle =
  mongoose.models.KnowledgeArticle || mongoose.model('KnowledgeArticle', knowledgeArticleSchema);

const KnowledgeArticleProxy = new Proxy(MongooseKnowledgeArticle, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in memoryDb.KnowledgeArticle) {
      return typeof memoryDb.KnowledgeArticle[prop] === 'function'
        ? memoryDb.KnowledgeArticle[prop].bind(memoryDb.KnowledgeArticle)
        : memoryDb.KnowledgeArticle[prop];
    }
    return target[prop];
  }
});

export const KnowledgeArticle = KnowledgeArticleProxy;
export default KnowledgeArticle;
