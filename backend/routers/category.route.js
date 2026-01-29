import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as categoryController from '../controllers/category.controller.js';
import * as dataValidator from '../middleware/data-validators.js';

const router = express.Router();

// Routes for logged in users
router.use(authController.protect);

router
  .route('/')
  .post(
    dataValidator.validateDataForCategory,
    categoryController.createCategory,
  );

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router.route('/').get(categoryController.getAllCategories);

router.route('/:id').delete(categoryController.deleteCategory);

export default router;
