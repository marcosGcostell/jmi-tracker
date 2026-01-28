import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as resourceController from '../controllers/resource.controller.js';
import * as dataValidator from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();

// Routes for logged in users
router.use(authController.protect);

router
  .route('/')
  .post(
    dataValidator.validateDataForResource,
    resourceController.createResource,
  );

router
  .route('/:id')
  .get(resourceController.getResource)
  .patch(resourceController.updateResource);

router
  .route('/:id/vacations')
  .get(filterQuery, resourceController.getWorkerVacations);

router
  .route('/:id/sick-leaves')
  .get(filterQuery, resourceController.getWorkerSickLeaves);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router.route('/').get(filterQuery, resourceController.getAllResources);

router.route('/:id').delete(resourceController.deleteResource);

export default router;
