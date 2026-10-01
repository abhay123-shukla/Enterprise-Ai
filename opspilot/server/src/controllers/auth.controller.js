import { User } from '../models/User.js';
import { hashPassword, comparePassword, signToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'employee', department = 'General' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department
    });

    const token = signToken({ id: user._id || user.id, email: user.email, role: user.role });

    const userObj = {
      _id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({ id: user._id || user.id, email: user.email, role: user.role });

    const userObj = {
      _id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      user: {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    next(error);
  }
};
