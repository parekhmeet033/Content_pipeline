const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const openaiService = require('../services/openai.service');
const { createNotification } = require('../services/notification.service');

const generate = asyncHandler(async (req, res) => {
  const result = await openaiService.generateContent(req.body);

  await createNotification({
    userId: req.user.id,
    type: 'CONTENT_GENERATED',
    title: 'AI content generated',
    message: `A draft titled "${result.title}" is ready for review.`,
  }).catch(() => {});

  sendSuccess(res, 200, { result });
});

const suggestions = asyncHandler(async (req, res) => {
  const { mode, topic, industry, contentId } = req.body;

  let currentBody;
  if (mode === 'improve') {
    if (!contentId) throw new ApiError(422, 'contentId is required for improve suggestions');
    const content = await prisma.content.findFirst({ where: { id: contentId, userId: req.user.id } });
    if (!content) throw new ApiError(404, 'Content not found');
    currentBody = content.body;
  }

  const result = await openaiService.generateSuggestions({ mode, topic, industry, currentBody });
  sendSuccess(res, 200, { result });
});

module.exports = { generate, suggestions };
