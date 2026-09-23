const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { hashValue, compareValue } = require('../utils/password');
const { SAFE_USER_SELECT } = require('../services/auth.service');

const updateProfile = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.avatarUrl === '') data.avatarUrl = null;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: SAFE_USER_SELECT,
  });
  sendSuccess(res, 200, { user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isValid = await compareValue(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError(400, 'Current password is incorrect');
  }
  const passwordHash = await hashValue(newPassword);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash, refreshTokenHash: null } });
  sendSuccess(res, 200, { updated: true });
});

const deleteAccount = asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.user.id } });
  res.clearCookie('refreshToken', { path: '/api/auth' });
  sendSuccess(res, 200, { deleted: true });
});

module.exports = { updateProfile, changePassword, deleteAccount };
