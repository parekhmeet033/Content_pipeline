const { Router } = require('express');
const controller = require('../controllers/content.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { aiRateLimiter } = require('../middleware/rateLimit.middleware');
const {
  createContentSchema,
  updateContentSchema,
  listContentSchema,
  contentIdSchema,
  versionIdSchema,
  updateStatusSchema,
  scheduleSchema,
} = require('../validators/content.validator');

const router = Router();
router.use(requireAuth);

router.get('/', validate(listContentSchema), controller.listContent);
router.post('/', validate(createContentSchema), controller.createContent);
router.get('/:id', validate(contentIdSchema), controller.getContent);
router.put('/:id', validate(updateContentSchema), controller.updateContent);
router.delete('/:id', validate(contentIdSchema), controller.deleteContent);
router.patch('/:id/status', validate(updateStatusSchema), controller.updateStatus);
router.patch('/:id/schedule', validate(scheduleSchema), controller.scheduleContent);
router.get('/:id/versions', validate(contentIdSchema), controller.listVersions);
router.get('/:id/versions/:versionId', validate(versionIdSchema), controller.getVersion);
router.post('/:id/versions/:versionId/restore', validate(versionIdSchema), controller.restoreVersion);
router.post('/:id/analyze', aiRateLimiter, validate(contentIdSchema), controller.analyzeContent);
router.post('/:id/improve', aiRateLimiter, validate(contentIdSchema), controller.improveAndReanalyze);
router.get('/:id/scores', validate(contentIdSchema), controller.listScores);

module.exports = router;
