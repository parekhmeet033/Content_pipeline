const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
    token: z.string().min(1, 'Reset code/token is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
