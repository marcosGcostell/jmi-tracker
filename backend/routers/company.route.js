import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as companyController from '../controllers/company.controller.js';
import * as dataValidator from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();

// Routes for logged in users
router.use(authController.protect);

router
  .route('/')
  .get(filterQuery, companyController.getAllCompanies)
  .post(dataValidator.validateDataForCompany, companyController.createCompany);

router
  .route('/:id')
  .get(companyController.getCompany)
  .patch(companyController.udpateCompany);

router
  .route('/:id/resources')
  .get(filterQuery, companyController.getCompanyResources);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router.route('/:id').delete(companyController.deleteCompany);

export default router;
