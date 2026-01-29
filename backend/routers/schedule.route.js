import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as scheduleController from '../controllers/schedule.controller.js';
import {
  checkRecordFields,
  checkFieldsForUpdate,
} from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();
const recordFields = [
  {
    name: 'companyId',
    type: 'id',
    required: true,
    message: 'Empresa',
  },
  {
    name: 'startTime',
    type: 'time',
    required: true,
    message: 'Hora de inicio de jornada',
  },
  {
    name: 'endTime',
    type: 'time',
    required: true,
    message: 'Hora de final de jornada',
  },
  {
    name: 'dayCorrection',
    type: 'int',
    required: true,
    message: 'Descuento de jornada en minutos',
  },
  {
    name: 'validFrom',
    type: 'date',
    required: true,
    message: 'Horario válido desde',
  },
  {
    name: 'validTo',
    type: 'date',
    required: false,
    message: 'Horario válido hasta',
  },
];

// Routes for logged in users
router.use(authController.protect);

router.route('/:id').get(scheduleController.getSchedule);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router.route('/:id');

router
  .route('/')
  .get(filterQuery, scheduleController.getAllSchedules)
  .post(checkRecordFields(recordFields), scheduleController.createSchedule);

router
  .route('/:id')
  .patch(checkFieldsForUpdate(recordFields), scheduleController.updateSchedule)
  .delete(scheduleController.deleteSchedule);

export default router;
