const { z } = require('zod');

const listNotificationsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    unreadOnly: z.coerce.boolean().optional(),
  }),
});

const notificationIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid('Invalid id') }),
});

module.exports = { listNotificationsSchema, notificationIdSchema };
