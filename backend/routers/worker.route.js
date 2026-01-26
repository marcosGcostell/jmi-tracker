import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as workerController from '../controllers/worker.controller.js';
import * as dataValidator from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();

// Routes for logged in users
router.use(authController.protect);

router
  .route('/')
  .post(dataValidator.validateDataForWorker, workerController.createWorker);

router
  .route('/:id')
  .get(workerController.getWorker)
  .patch(workerController.updateWorker);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router.route('/').get(filterQuery, workerController.getAllWorkers);

router.route('/:id').delete(workerController.deleteWorker);

export default router;
