const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { hashValue, compareValue } = require('../utils/password');
const { verifyRefreshToken } = require('../utils/jwt');
const { SAFE_USER_SELECT, issueTokens } = require('../services/auth.service');
const { env } = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await hashValue(password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      lastLoginAt: new Date(),
      settings: { create: {} },
    },
    select: SAFE_USER_SELECT,
  });

  const { accessToken, refreshToken } = await issueTokens(user);
  setRefreshCookie(res, refreshToken);

  sendSuccess(res, 201, { user, accessToken });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isValid = await compareValue(password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const { accessToken, refreshToken } = await issueTokens(user);
  setRefreshCookie(res, refreshToken);

  const safeUser = await prisma.user.findUnique({ where: { id: user.id }, select: SAFE_USER_SELECT });
  sendSuccess(res, 200, { user: safeUser, accessToken });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw new ApiError(401, 'No refresh token provided');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.refreshTokenHash) {
    clearRefreshCookie(res);
    throw new ApiError(401, 'Session no longer valid');
  }

  const matches = await compareValue(token, user.refreshTokenHash);
  if (!matches) {
    clearRefreshCookie(res);
    throw new ApiError(401, 'Session no longer valid');
  }

  const { accessToken, refreshToken } = await issueTokens(user);
  setRefreshCookie(res, refreshToken);

  const safeUser = await prisma.user.findUnique({ where: { id: user.id }, select: SAFE_USER_SELECT });
  sendSuccess(res, 200, { user: safeUser, accessToken });
});

const logout = asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { refreshTokenHash: null } });
  clearRefreshCookie(res);
  sendSuccess(res, 200, { loggedOut: true });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: SAFE_USER_SELECT });
  if (!user) throw new ApiError(404, 'User not found');
  sendSuccess(res, 200, { user });
});

module.exports = { register, login, refresh, logout, me };
