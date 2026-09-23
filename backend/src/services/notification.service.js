const prisma = require('../config/db');

function createNotification({ userId, type, title, message, contentId = null }) {
  return prisma.notification.create({
    data: { userId, type, title, message, contentId },
  });
}

module.exports = { createNotification };
