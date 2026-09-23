const { Router } = require('express');
const controller = require('../controllers/settings.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { updateSettingsSchema } = require('../validators/settings.validator');

const router = Router();
router.use(requireAuth);

router.get('/', controller.getSettings);
router.put('/', validate(updateSettingsSchema), controller.updateSettings);

module.exports = router;
