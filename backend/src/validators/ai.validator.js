const { z } = require('zod');
const { CONTENT_TYPES, CONTENT_TONES, CONTENT_LENGTHS } = require('../utils/constants');

const generateContentSchema = z.object({
  body: z.object({
    topic: z.string().min(1, 'Topic is required').max(300),
    contentType: z.enum(CONTENT_TYPES),
    targetAudience: z.string().max(300).optional(),
    tone: z.enum(CONTENT_TONES),
    keywords: z.array(z.string().min(1).max(60)).max(30).optional(),
    length: z.enum(CONTENT_LENGTHS).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const suggestionsSchema = z.object({
  body: z.object({
    mode: z.enum(['topics', 'titles', 'improve']),
    topic: z.string().max(300).optional(),
    industry: z.string().max(150).optional(),
    contentId: z.string().uuid().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { generateContentSchema, suggestionsSchema };
