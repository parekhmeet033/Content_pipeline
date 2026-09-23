const { Router } = require('express');
const controller = require('../controllers/score.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();
router.use(requireAuth);

router.get('/overview', controller.getOverview);

module.exports = router;
