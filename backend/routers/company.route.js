import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as companyController from '../controllers/company.controller.js';
import {
  checkRecordFields,
  checkFieldsForUpdate,
} from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();
const requiredFields = [
  { name: 'name', type: 'text', required: true, message: 'Nombre' },
];

// Routes for logged in users
router.use(authController.protect);

router
  .route('/')
  .get(filterQuery, companyController.getAllCompanies)
  .post(checkRecordFields(requiredFields), companyController.createCompany);

router
  .route('/:id')
  .get(companyController.getCompany)
  .patch(checkFieldsForUpdate(requiredFields), companyController.udpateCompany);

router
  .route('/:id/resources')
  .get(filterQuery, companyController.getCompanyResources);

router
  .route('/:id/categories')
  .get(filterQuery, companyController.getCompanyCategories);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router.route('/:id').delete(companyController.deleteCompany);

export default router;
