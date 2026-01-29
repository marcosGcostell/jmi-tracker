import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as sickLeaveController from '../controllers/sick-leave.controller.js';
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
    required: false,
    message: 'Fecha de final',
  },
];

// Routes for logged in users
router.use(authController.protect);

router.route('/:id').get(sickLeaveController.getSickLeave);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(filterQuery, sickLeaveController.getAllSickLeaves)
  .post(checkRecordFields(recordFields), sickLeaveController.createSickLeave);

router
  .route('/:id')
  .patch(
    checkFieldsForUpdate(recordFields),
    sickLeaveController.updateSickLeave,
  )
  .delete(sickLeaveController.deleteSickLeave);

export default router;
