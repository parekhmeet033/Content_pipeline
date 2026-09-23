const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');

const listNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.validatedQuery;
  const where = { userId: req.user.id, ...(unreadOnly ? { isRead: false } : {}) };

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  sendSuccess(res, 200, { items, total, page, limit, pageCount: Math.max(1, Math.ceil(total / limit)) });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
  sendSuccess(res, 200, { count });
});

const markRead = asyncHandler(async (req, res) => {
  const existing = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Notification not found');

  const notification = await prisma.notification.update({ where: { id: existing.id }, data: { isRead: true } });
  sendSuccess(res, 200, { notification });
});

const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
  sendSuccess(res, 200, { updated: true });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const existing = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Notification not found');

  await prisma.notification.delete({ where: { id: existing.id } });
  sendSuccess(res, 200, { deleted: true });
});

module.exports = { listNotifications, getUnreadCount, markRead, markAllRead, deleteNotification };
