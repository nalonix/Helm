// src/schemas/eventSchema.ts (Example - adjust as per your Zod setup)
import { z } from 'zod';

export const createEventSchema = z.object({
  poster: z.string().url().optional(), // Assuming poster is a URL string
  title: z.string().min(3, 'Title is required and must be at least 3 characters.'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required.'),
  startTime: z.string().min(1, 'Time is required.'),
  endTime: z.string().min(1, 'Time is required.'),
  locationName: z.string().min(1, 'Location is required. Please select from suggestions.'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude.').optional(),
  longitude: z.number().min(-180).max(180, 'Invalid longitude.').optional(),
  city: z.string().min(1, 'City is required.').optional(), // New: Make it optional initially, but will be set on selection
  country: z.string().min(1, 'Country is required.').optional(), // New: Make it optional initially, but will be set on selection
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;