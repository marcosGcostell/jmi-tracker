import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as workSiteController from '../controllers/work-site.controller.js';
import * as dataValidator from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();

// Routes for logged in users
router.use(authController.protect);

router.route('/:id').get(workSiteController.getWorkSite);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(filterQuery, workSiteController.getAllWorkSites)
  .post(
    dataValidator.validateDataForWorkSites,
    workSiteController.createWorkSite,
  );

router.route('/:id').patch(workSiteController.updateWorkSite);

export default router;
