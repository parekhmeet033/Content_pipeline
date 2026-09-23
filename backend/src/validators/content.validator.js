const { z } = require('zod');
const {
  CONTENT_TYPES,
  CONTENT_TONES,
  CONTENT_STATUSES,
} = require('../utils/constants');

const idParamSchema = z.object({ id: z.string().uuid('Invalid id') });
const versionIdParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
  versionId: z.string().uuid('Invalid version id'),
});

const createContentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(300),
    body: z.string().min(1, 'Content body is required'),
    excerpt: z.string().max(500).nullable().optional(),
    type: z.enum(CONTENT_TYPES),
    tone: z.enum(CONTENT_TONES),
    targetAudience: z.string().max(300).nullable().optional(),
    keywords: z.array(z.string().min(1).max(60)).max(30).optional(),
    status: z.enum(CONTENT_STATUSES).optional(),
    categoryId: z.string().uuid().nullable().optional(),
    aiGenerated: z.boolean().optional(),
    aiPrompt: z.string().nullable().optional(),
    scheduledAt: z.string().datetime().nullable().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateContentSchema = z.object({
  body: createContentSchema.shape.body.partial().extend({
    changeNote: z.string().max(300).nullable().optional(),
  }),
  query: z.object({}).optional(),
  params: idParamSchema,
});

const listContentSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().max(200).optional(),
    status: z.enum(CONTENT_STATUSES).optional(),
    type: z.enum(CONTENT_TYPES).optional(),
    tone: z.enum(CONTENT_TONES).optional(),
    categoryId: z.string().uuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'scheduledAt']).optional(),
    sortDir: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

const contentIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: idParamSchema,
});

const versionIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: versionIdParamSchema,
});

const updateStatusSchema = z.object({
  body: z.object({ status: z.enum(CONTENT_STATUSES) }),
  query: z.object({}).optional(),
  params: idParamSchema,
});

const scheduleSchema = z.object({
  body: z.object({ scheduledAt: z.string().datetime('Provide a valid ISO date') }),
  query: z.object({}).optional(),
  params: idParamSchema,
});

module.exports = {
  createContentSchema,
  updateContentSchema,
  listContentSchema,
  contentIdSchema,
  versionIdSchema,
  updateStatusSchema,
  scheduleSchema,
};
