const prisma = require('../config/db');
const { hashValue } = require('../utils/password');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  jobTitle: true,
  company: true,
  avatarUrl: true,
  bio: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const refreshTokenHash = await hashValue(refreshToken);
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash } });
  return { accessToken, refreshToken };
}

module.exports = { SAFE_USER_SELECT, issueTokens };
