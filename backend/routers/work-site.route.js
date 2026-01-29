import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as workSiteController from '../controllers/work-site.controller.js';
import {
  checkRecordFields,
  checkFieldsForUpdate,
} from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();
const recordFields = [
  { name: 'name', type: 'text', required: true, message: 'Nombre' },
  { name: 'code', type: 'text', required: true, message: 'Código' },
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

router.route('/:id').get(workSiteController.getWorkSite);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(filterQuery, workSiteController.getAllWorkSites)
  .post(checkRecordFields(recordFields), workSiteController.createWorkSite);

router
  .route('/:id')
  .patch(checkFieldsForUpdate(recordFields), workSiteController.updateWorkSite);

export default router;
