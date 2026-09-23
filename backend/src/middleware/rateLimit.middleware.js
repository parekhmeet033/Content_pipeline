const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { env } = require('../config/env');

const aiRateLimiter = rateLimit({
  windowMs: env.aiRateLimitWindowMs,
  limit: env.aiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  message: { success: false, message: 'Too many AI requests, please try again later.' },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

module.exports = { aiRateLimiter, authRateLimiter };
