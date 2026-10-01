import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  department: z.enum(['IT', 'HR', 'Finance', 'Facilities', 'Procurement', 'General']).optional().default('IT'),
  category: z.string().optional().default('General'),
  tags: z.array(z.string()).optional().default([])
});
