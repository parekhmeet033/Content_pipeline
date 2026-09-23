const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await prisma.userSettings.findUnique({ where: { userId: req.user.id } });
  if (!settings) {
    settings = await prisma.userSettings.create({ data: { userId: req.user.id } });
  }
  sendSuccess(res, 200, { settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.userSettings.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id, ...req.body },
    update: req.body,
  });
  sendSuccess(res, 200, { settings });
});

module.exports = { getSettings, updateSettings };
