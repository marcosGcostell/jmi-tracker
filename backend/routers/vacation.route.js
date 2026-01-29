import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as vacationController from '../controllers/vacation.controller.js';
import {
  checkRecordFields,
  checkFieldsForUpdate,
} from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();
const recordFields = [
  {
    name: 'resourceId',
    type: 'id',
    required: true,
    message: 'Trabajador seleccionado',
  },
  {
    name: 'startDate',
    type: 'date',
    required: true,
    message: 'Fecha de inicio',
  },
  {
    name: 'endDate',
    type: 'date',
    required: true,
    message: 'Fecha de final',
  },
];

// Routes for logged in users
router.use(authController.protect);

router.route('/:id').get(vacationController.getVacation);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(filterQuery, vacationController.getAllVacations)
  .post(checkRecordFields(recordFields), vacationController.createVacation);

router
  .route('/:id')
  .patch(checkFieldsForUpdate(recordFields), vacationController.updateVacation)
  .delete(vacationController.deleteVacation);

export default router;
