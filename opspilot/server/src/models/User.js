import mongoose from 'mongoose';
import { memoryDb } from './store.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'agent', 'admin'], default: 'employee' },
    department: { type: String, default: 'General' },
    avatar: { type: String, default: '' }
  },
  { timestamps: true }
);

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in memoryDb.User) {
      return typeof memoryDb.User[prop] === 'function'
        ? memoryDb.User[prop].bind(memoryDb.User)
        : memoryDb.User[prop];
    }
    return target[prop];
  }
});

export const User = UserProxy;
export default User;
