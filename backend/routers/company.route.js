import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as companyController from '../controllers/company.controller.js';
import * as appValidators from '../middleware/app-validators.js';

const router = express.Router();

// Routes for logged in users
router.use(authController.protect);

router
  .route('/')
  .get(companyController.getAllCompanies)
  .post(companyController.createCompany);

router
  .route('/:id')
  .get(companyController.getCompany)
  .patch(companyController.udpateCompany);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router.route('/:id').delete(companyController.deleteCompany);

export default router;
