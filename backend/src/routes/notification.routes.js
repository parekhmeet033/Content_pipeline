const { Router } = require('express');
const controller = require('../controllers/notification.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { listNotificationsSchema, notificationIdSchema } = require('../validators/notification.validator');

const router = Router();
router.use(requireAuth);

router.get('/', validate(listNotificationsSchema), controller.listNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', validate(notificationIdSchema), controller.markRead);
router.delete('/:id', validate(notificationIdSchema), controller.deleteNotification);

module.exports = router;
