import { User } from '../models/User.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (department && department !== 'all') filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    const safeUsers = users.map(u => ({
      _id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      createdAt: u.createdAt
    }));

    res.status(200).json({ users: safeUsers });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['employee', 'agent', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'employee', 'agent', or 'admin'" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        _id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department
      }
    });
  } catch (error) {
    next(error);
  }
};
