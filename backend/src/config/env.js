require('dotenv/config');

const REQUIRED_VARS = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

function assertRequiredEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || '',
  // Optional per-task overrides — each falls back to the default OPENAI_* var when unset, so a
  // single model/key still works out of the box, but any task can be pointed at a different
  // model (e.g. a stronger model for long-form generation, a cheaper/faster one for suggestions)
  // and, if that model lives on a separate account/key, a different API key too.
  openaiModelGenerate: process.env.OPENAI_MODEL_GENERATE || process.env.OPENAI_MODEL || 'gpt-4o-mini',
  openaiModelSuggestions: process.env.OPENAI_MODEL_SUGGESTIONS || process.env.OPENAI_MODEL || 'gpt-4o-mini',
  openaiModelAnalyze: process.env.OPENAI_MODEL_ANALYZE || process.env.OPENAI_MODEL || 'gpt-4o-mini',
  openaiApiKeyGenerate: process.env.OPENAI_API_KEY_GENERATE || process.env.OPENAI_API_KEY || '',
  openaiApiKeySuggestions: process.env.OPENAI_API_KEY_SUGGESTIONS || process.env.OPENAI_API_KEY || '',
  openaiApiKeyAnalyze: process.env.OPENAI_API_KEY_ANALYZE || process.env.OPENAI_API_KEY || '',
  aiRateLimitWindowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  aiRateLimitMax: Number(process.env.AI_RATE_LIMIT_MAX) || 20,
};

module.exports = { env, assertRequiredEnv };
