import mongoose from 'mongoose';
import { memoryDb } from './store.js';

const commentSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    isInternal: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const MongooseComment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

const CommentProxy = new Proxy(MongooseComment, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in memoryDb.Comment) {
      return typeof memoryDb.Comment[prop] === 'function'
        ? memoryDb.Comment[prop].bind(memoryDb.Comment)
        : memoryDb.Comment[prop];
    }
    return target[prop];
  }
});

export const Comment = CommentProxy;
export default Comment;
