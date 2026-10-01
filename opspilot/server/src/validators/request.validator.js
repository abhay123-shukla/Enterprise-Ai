import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  department: z.enum(['IT', 'HR', 'Finance', 'Facilities', 'Procurement', 'General']).optional(),
  category: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical', 'low', 'medium', 'high', 'critical']).optional()
});

export const updateRequestSchema = z.object({
  status: z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical', 'low', 'medium', 'high', 'critical']).optional(),
  assignedTo: z.string().nullable().optional(),
  department: z.enum(['IT', 'HR', 'Finance', 'Facilities', 'Procurement', 'General']).optional(),
  category: z.string().optional()
});
