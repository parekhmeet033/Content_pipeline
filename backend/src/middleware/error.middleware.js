const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const PRISMA_ERROR_MAP = {
  P2002: (err) => new ApiError(409, `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists`),
  P2025: () => new ApiError(404, 'Record not found'),
  P2003: () => new ApiError(409, 'This action violates a related record constraint'),
};

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  let error = err;

  if (err?.code && PRISMA_ERROR_MAP[err.code]) {
    error = PRISMA_ERROR_MAP[err.code](err);
  } else if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Invalid or expired authentication token');
  } else if (!(error instanceof ApiError)) {
    error = new ApiError(500, err?.message || 'Internal server error');
  }

  if (error.statusCode >= 500) {
    logger.error(error.message, err.stack);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    errors: error.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = errorMiddleware;
