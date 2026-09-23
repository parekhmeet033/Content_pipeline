const { z } = require('zod');

const idParamSchema = z.object({ id: z.string().uuid('Invalid id') });

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).nullable().optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex value like #6366F1')
      .optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateCategorySchema = z.object({
  body: createCategorySchema.shape.body.partial(),
  query: z.object({}).optional(),
  params: idParamSchema,
});

const categoryIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: idParamSchema,
});

module.exports = { createCategorySchema, updateCategorySchema, categoryIdSchema };
