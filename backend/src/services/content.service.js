function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const SAFE_INCLUDE = {
  category: { select: { id: true, name: true, color: true } },
};

function buildContentWhere({ userId, search, status, type, tone, categoryId, from, to }) {
  const where = { userId };
  if (status) where.status = status;
  if (type) where.type = type;
  if (tone) where.tone = tone;
  if (categoryId) where.categoryId = categoryId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
      { keywords: { has: search } },
    ];
  }
  return where;
}

module.exports = { countWords, buildContentWhere, SAFE_INCLUDE };
