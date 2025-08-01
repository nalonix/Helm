import { z } from 'zod';

export const signUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string()
    .min(4, '+4 character username is required')
    .regex(/^\S+$/, 'Username cannot contain whitespace'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});


export type SignUpFormData = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;