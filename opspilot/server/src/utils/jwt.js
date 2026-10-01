import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env.js';

export const signToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (candidate, hash) => {
  return bcrypt.compare(candidate, hash);
};
