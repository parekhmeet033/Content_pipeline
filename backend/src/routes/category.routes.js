const { Router } = require('express');
const controller = require('../controllers/category.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { createCategorySchema, updateCategorySchema, categoryIdSchema } = require('../validators/category.validator');

const router = Router();
router.use(requireAuth);

router.get('/', controller.listCategories);
router.post('/', validate(createCategorySchema), controller.createCategory);
router.get('/:id', validate(categoryIdSchema), controller.getCategory);
router.put('/:id', validate(updateCategorySchema), controller.updateCategory);
router.delete('/:id', validate(categoryIdSchema), controller.deleteCategory);

module.exports = router;
