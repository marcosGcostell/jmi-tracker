import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as categoryController from '../controllers/category.controller.js';
import {
  checkRecordFields,
  checkFieldsForUpdate,
} from '../middleware/data-validators.js';

const router = express.Router();
const requiredFields = [
  { name: 'name', type: 'text', required: true, message: 'Nombre' },
  {
    name: 'companyId',
    type: 'id',
    required: false,
    message: 'Empresa a la que pertenece',
  },
];

// Routes for logged in users
router.use(authController.protect);

router
  .route('/')
  .post(checkRecordFields(requiredFields), categoryController.createCategory);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(
    checkFieldsForUpdate(requiredFields),
    categoryController.updateCategory,
  );

// Routes for admins only
router.use(authController.restrictTo('admin'));

router.route('/').get(categoryController.getAllCategories);

router.route('/:id').delete(categoryController.deleteCategory);

export default router;
