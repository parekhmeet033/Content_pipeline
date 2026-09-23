const { z } = require('zod');

const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    jobTitle: z.string().max(150).nullable().optional(),
    company: z.string().max(150).nullable().optional(),
    bio: z.string().max(1000).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional().or(z.literal('')),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { updateProfileSchema, changePasswordSchema };
