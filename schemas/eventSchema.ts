import { z } from 'zod';

export const createEventSchema = z.object({
  poster: z.string().default('/assets/images/default-poster.jpg').optional(), // Default poster image
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
//   date: z.string().min(1, 'Date is required'), 
//   time: z.string().min(1, 'Time is required'),
//   location: z.string().min(3, 'Location is required'),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;