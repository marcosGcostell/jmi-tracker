import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as resourceController from '../controllers/resource.controller.js';
import {
  checkRecordFields,
  checkFieldsForUpdate,
} from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';

const router = express.Router();
const recordFields = [
  { name: 'name', type: 'text', required: true, message: 'Nombre' },
  {
    name: 'companyId',
    type: 'id',
    required: true,
    message: 'Empresa a la que pertenece',
  },
  {
    name: 'categoryId',
    type: 'id',
    required: true,
    message: 'Categoría',
  },
  {
    name: 'userId',
    type: 'id',
    required: false,
    message: 'Usuario referenciado',
  },
  {
    name: 'resourceType',
    type: 'resource',
    required: false,
    message: 'Tipo de recurso',
  },
];

// Routes for logged in users
router.use(authController.protect);

router
  .route('/')
  .post(checkRecordFields(recordFields), resourceController.createResource);

router
  .route('/:id')
  .get(resourceController.getResource)
  .patch(checkFieldsForUpdate(recordFields), resourceController.updateResource);

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
