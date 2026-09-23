const { z } = require('zod');
const { CONTENT_TYPES, CONTENT_TONES, CONTENT_LENGTHS, THEMES } = require('../utils/constants');

const updateSettingsSchema = z.object({
  body: z.object({
    theme: z.enum(THEMES).optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    defaultTone: z.enum(CONTENT_TONES).optional(),
    defaultContentType: z.enum(CONTENT_TYPES).optional(),
    defaultLength: z.enum(CONTENT_LENGTHS).optional(),
    aiCreativity: z.number().min(0).max(1).optional(),
    language: z.string().min(2).max(10).optional(),
    timezone: z.string().min(1).max(100).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { updateSettingsSchema };
