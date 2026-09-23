const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { countWords, buildContentWhere, SAFE_INCLUDE } = require('../services/content.service');
const { createNotification } = require('../services/notification.service');
const openaiService = require('../services/openai.service');

async function assertCategoryOwnership(categoryId, userId) {
  if (!categoryId) return;
  const category = await prisma.contentCategory.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new ApiError(404, 'Category not found');
}

const listContent = asyncHandler(async (req, res) => {
  const { search, status, type, tone, categoryId, from, to, sortBy, sortDir, page = 1, limit = 12 } = req.validatedQuery;

  const where = buildContentWhere({ userId: req.user.id, search, status, type, tone, categoryId, from, to });
  const orderBy = { [sortBy || 'updatedAt']: sortDir || 'desc' };

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      include: SAFE_INCLUDE,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.content.count({ where }),
  ]);

  sendSuccess(res, 200, { items, total, page, limit, pageCount: Math.max(1, Math.ceil(total / limit)) });
});

const createContent = asyncHandler(async (req, res) => {
  const { title, body, excerpt, type, tone, targetAudience, keywords, status, categoryId, aiGenerated, aiPrompt, scheduledAt } =
    req.body;

  await assertCategoryOwnership(categoryId, req.user.id);

  const content = await prisma.$transaction(async (tx) => {
    const created = await tx.content.create({
      data: {
        title,
        body,
        excerpt: excerpt || null,
        type,
        tone,
        targetAudience: targetAudience || null,
        keywords: keywords || [],
        status: status || 'DRAFT',
        categoryId: categoryId || null,
        aiGenerated: Boolean(aiGenerated),
        aiPrompt: aiPrompt || null,
        wordCount: countWords(body),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        userId: req.user.id,
      },
      include: SAFE_INCLUDE,
    });

    await tx.contentVersion.create({
      data: {
        contentId: created.id,
        versionNum: 1,
        title: created.title,
        body: created.body,
        changeNote: 'Initial version',
        editedById: req.user.id,
      },
    });

    return created;
  });

  sendSuccess(res, 201, { content });
});

const getContent = asyncHandler(async (req, res) => {
  const content = await prisma.content.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: SAFE_INCLUDE,
  });
  if (!content) throw new ApiError(404, 'Content not found');

  sendSuccess(res, 200, { content });
});

const updateContent = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  const { changeNote, ...fields } = req.body;
  if (fields.categoryId !== undefined) await assertCategoryOwnership(fields.categoryId, req.user.id);
  if (fields.scheduledAt !== undefined) fields.scheduledAt = fields.scheduledAt ? new Date(fields.scheduledAt) : null;
  if (fields.body !== undefined) fields.wordCount = countWords(fields.body);

  const content = await prisma.$transaction(async (tx) => {
    const updated = await tx.content.update({
      where: { id: existing.id },
      data: fields,
      include: SAFE_INCLUDE,
    });

    const lastVersion = await tx.contentVersion.findFirst({
      where: { contentId: existing.id },
      orderBy: { versionNum: 'desc' },
    });

    await tx.contentVersion.create({
      data: {
        contentId: existing.id,
        versionNum: (lastVersion?.versionNum || 0) + 1,
        title: updated.title,
        body: updated.body,
        changeNote: changeNote || null,
        editedById: req.user.id,
      },
    });

    return updated;
  });

  sendSuccess(res, 200, { content });
});

const deleteContent = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  await prisma.content.delete({ where: { id: existing.id } });
  sendSuccess(res, 200, { deleted: true });
});

const updateStatus = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  const { status } = req.body;
  const data = { status };
  if (status === 'PUBLISHED') data.publishedAt = new Date();

  const content = await prisma.content.update({ where: { id: existing.id }, data, include: SAFE_INCLUDE });

  if (status === 'PUBLISHED') {
    await createNotification({
      userId: req.user.id,
      type: 'CONTENT_PUBLISHED',
      title: 'Content published',
      message: `"${content.title}" has been published.`,
      contentId: content.id,
    });
  }

  sendSuccess(res, 200, { content });
});

const scheduleContent = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  const scheduledAt = new Date(req.body.scheduledAt);
  const content = await prisma.content.update({
    where: { id: existing.id },
    data: { status: 'SCHEDULED', scheduledAt },
    include: SAFE_INCLUDE,
  });

  await createNotification({
    userId: req.user.id,
    type: 'CONTENT_SCHEDULED',
    title: 'Content scheduled',
    message: `"${content.title}" is scheduled for ${scheduledAt.toLocaleString()}.`,
    contentId: content.id,
  });

  sendSuccess(res, 200, { content });
});

const listVersions = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  const versions = await prisma.contentVersion.findMany({
    where: { contentId: existing.id },
    orderBy: { versionNum: 'desc' },
  });
  sendSuccess(res, 200, { versions });
});

const getVersion = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  const version = await prisma.contentVersion.findFirst({
    where: { id: req.params.versionId, contentId: existing.id },
  });
  if (!version) throw new ApiError(404, 'Version not found');
  sendSuccess(res, 200, { version });
});

const restoreVersion = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  const target = await prisma.contentVersion.findFirst({
    where: { id: req.params.versionId, contentId: existing.id },
  });
  if (!target) throw new ApiError(404, 'Version not found');

  const content = await prisma.$transaction(async (tx) => {
    const updated = await tx.content.update({
      where: { id: existing.id },
      data: { title: target.title, body: target.body, wordCount: countWords(target.body) },
      include: SAFE_INCLUDE,
    });

    const lastVersion = await tx.contentVersion.findFirst({
      where: { contentId: existing.id },
      orderBy: { versionNum: 'desc' },
    });

    await tx.contentVersion.create({
      data: {
        contentId: existing.id,
        versionNum: (lastVersion?.versionNum || 0) + 1,
        title: updated.title,
        body: updated.body,
        changeNote: `Restored from version ${target.versionNum}`,
        editedById: req.user.id,
      },
    });

    return updated;
  });

  sendSuccess(res, 200, { content });
});

const analyzeContent = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  const result = await openaiService.analyzeContent({
    title: existing.title,
    body: existing.body,
    type: existing.type,
    tone: existing.tone,
    targetAudience: existing.targetAudience,
  });

  const score = await prisma.contentScore.create({
    data: { contentId: existing.id, ...result },
  });

  await createNotification({
    userId: req.user.id,
    type: 'CONTENT_ANALYZED',
    title: 'Content analyzed',
    message: `"${existing.title}" scored ${result.overallScore}/100.`,
    contentId: existing.id,
  }).catch(() => {});

  sendSuccess(res, 201, { score });
});

const improveAndReanalyze = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  const latestScore = await prisma.contentScore.findFirst({
    where: { contentId: existing.id },
    orderBy: { createdAt: 'desc' },
  });
  if (!latestScore) {
    throw new ApiError(422, 'Analyze this content first, then use "Improve & re-analyze" to fix what it finds.');
  }

  const rewritten = await openaiService.improveContent({
    title: existing.title,
    body: existing.body,
    type: existing.type,
    tone: existing.tone,
    targetAudience: existing.targetAudience,
    keywords: existing.keywords,
    issues: latestScore.issues,
  });

  const newTitle = typeof rewritten?.title === 'string' && rewritten.title.trim() ? rewritten.title.trim() : existing.title;
  const newBody = typeof rewritten?.body === 'string' && rewritten.body.trim() ? rewritten.body.trim() : existing.body;

  const content = await prisma.$transaction(async (tx) => {
    const updated = await tx.content.update({
      where: { id: existing.id },
      data: { title: newTitle, body: newBody, wordCount: countWords(newBody) },
      include: SAFE_INCLUDE,
    });

    const lastVersion = await tx.contentVersion.findFirst({
      where: { contentId: existing.id },
      orderBy: { versionNum: 'desc' },
    });

    await tx.contentVersion.create({
      data: {
        contentId: existing.id,
        versionNum: (lastVersion?.versionNum || 0) + 1,
        title: updated.title,
        body: updated.body,
        changeNote: 'AI-improved based on analysis feedback',
        editedById: req.user.id,
      },
    });

    return updated;
  });

  const analysis = await openaiService.analyzeContent({
    title: content.title,
    body: content.body,
    type: content.type,
    tone: content.tone,
    targetAudience: content.targetAudience,
  });

  const score = await prisma.contentScore.create({
    data: { contentId: content.id, ...analysis },
  });

  await createNotification({
    userId: req.user.id,
    type: 'CONTENT_ANALYZED',
    title: 'Content improved',
    message: `"${content.title}" was rewritten and re-scored ${score.overallScore}/100.`,
    contentId: content.id,
  }).catch(() => {});

  sendSuccess(res, 200, { content, score });
});

const listScores = asyncHandler(async (req, res) => {
  const existing = await prisma.content.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Content not found');

  const scores = await prisma.contentScore.findMany({
    where: { contentId: existing.id },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, 200, { scores });
});

module.exports = {
  listContent,
  createContent,
  getContent,
  updateContent,
  deleteContent,
  updateStatus,
  scheduleContent,
  listVersions,
  getVersion,
  restoreVersion,
  analyzeContent,
  improveAndReanalyze,
  listScores,
};
