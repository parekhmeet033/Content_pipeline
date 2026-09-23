const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const getOverview = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalContent, statusCounts, latestScores] = await Promise.all([
    prisma.content.count({ where: { userId } }),
    prisma.content.groupBy({ by: ['status'], where: { userId }, _count: { _all: true } }),
    // One row per content — the most recent analysis run for each piece of content.
    prisma.contentScore.findMany({
      where: { content: { userId } },
      orderBy: [{ contentId: 'asc' }, { createdAt: 'desc' }],
      distinct: ['contentId'],
      select: { overallScore: true, needsCorrection: true },
    }),
  ]);

  const totalAnalyzed = latestScores.length;
  const avgOverallScore = totalAnalyzed
    ? Math.round(latestScores.reduce((sum, s) => sum + s.overallScore, 0) / totalAnalyzed)
    : 0;
  const needsCorrectionCount = latestScores.filter((s) => s.needsCorrection).length;

  sendSuccess(res, 200, {
    totalContent,
    totalAnalyzed,
    avgOverallScore,
    needsCorrectionCount,
    byStatus: statusCounts.map((s) => ({ status: s.status, count: s._count._all })),
  });
});

module.exports = { getOverview };
