import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as sickLeaveController from '../controllers/sick-leave.controller.js';
import * as dataValidator from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();

// Routes for logged in users
router.use(authController.protect);

router.route('/:id').get(sickLeaveController.getSickLeave);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(filterQuery, sickLeaveController.getAllSickLeaves)
  .post(
    dataValidator.validateDataForSickLeaves,
    sickLeaveController.createSickLeave,
  );

router
  .route('/:id')
  .patch(sickLeaveController.updateSickLeave)
  .delete(sickLeaveController.deleteSickLeave);

export default router;
