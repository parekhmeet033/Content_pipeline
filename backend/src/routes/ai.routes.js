const { Router } = require('express');
const controller = require('../controllers/ai.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { aiRateLimiter } = require('../middleware/rateLimit.middleware');
const { generateContentSchema, suggestionsSchema, analyzeImageSchema } = require('../validators/ai.validator');

const router = Router();
router.use(requireAuth, aiRateLimiter);

router.post('/generate', validate(generateContentSchema), controller.generate);
router.post('/suggestions', validate(suggestionsSchema), controller.suggestions);
router.post('/analyze-image', validate(analyzeImageSchema), controller.analyzeImage);

module.exports = router;
