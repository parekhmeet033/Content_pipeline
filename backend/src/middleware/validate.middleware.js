const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    return next(new ApiError(422, 'Validation failed', result.error.flatten()));
  }
  if (result.data.body) req.body = result.data.body;
  // req.query is a getter-only accessor in Express 5 (no setter), so coerced/typed
  // query values (e.g. page/limit as numbers) are exposed separately here instead
  // of being lost by a silently-ignored `req.query = ...` reassignment.
  if (result.data.query) req.validatedQuery = result.data.query;
  if (result.data.params) req.params = result.data.params;
  next();
};

module.exports = validate;
