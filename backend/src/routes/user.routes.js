const { Router } = require('express');
const controller = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { updateProfileSchema, changePasswordSchema } = require('../validators/user.validator');

const router = Router();
router.use(requireAuth);

router.put('/me', validate(updateProfileSchema), controller.updateProfile);
router.put('/me/password', validate(changePasswordSchema), controller.changePassword);
router.delete('/me', controller.deleteAccount);

module.exports = router;
