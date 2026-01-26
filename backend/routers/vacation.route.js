import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as vacationController from '../controllers/vacation.controller.js';
import * as dataValidator from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();

// Routes for logged in users
router.use(authController.protect);

router.route('/:id').get(vacationController.getVacation);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(filterQuery, vacationController.getAllVacations)
  .post(
    dataValidator.validateDataForVacations,
    vacationController.createVacation,
  );

router
  .route('/:id')
  .patch(vacationController.updateVacation)
  .delete(vacationController.deleteVacation);

export default router;
