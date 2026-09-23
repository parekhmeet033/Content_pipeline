const { Router } = require('express');

const router = Router();

router.get('/', (req, res) =>
  res.status(200).json({ success: true, message: 'ContentNova API is running', version: '1.0.0' })
);

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } }));

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/categories', require('./category.routes'));
router.use('/content', require('./content.routes'));
router.use('/scores', require('./score.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/settings', require('./settings.routes'));
router.use('/ai', require('./ai.routes'));

module.exports = router;
