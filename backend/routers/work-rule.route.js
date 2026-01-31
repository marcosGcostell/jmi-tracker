import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as workRuleController from '../controllers/work-rule.controller.js';
import { checkRecordFields } from '../middleware/data-validators.js';
import filterQuery from '../middleware/filter-query.js';
import filterWorkRuleQuery from '../middleware/filter-work-rule-query.js';

const router = express.Router();
const recordFields = [
  {
    name: 'workSiteId',
    type: 'id',
    required: true,
    message: 'Obra',
  },
  {
    name: 'companyId',
    type: 'id',
    required: true,
    message: 'Empresa',
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
    message: 'Regla válida desde',
  },
  {
    name: 'validTo',
    type: 'date',
    required: false,
    message: 'Regla válida hasta',
  },
];

// Routes for logged in users
router.use(authController.protect);

router
  .route('/resolve')
  .get(filterQuery, filterWorkRuleQuery, workRuleController.resolveGetWorkRules)
  .post(
    filterWorkRuleQuery,
    checkRecordFields(recordFields, { exclude: ['workSiteId', 'companyId'] }),
    workRuleController.resolvePostWorkRule,
  );

router.route('/:id').get(workRuleController.getWorkRule);

router
  .route('/:id')
  .patch(
    checkRecordFields(recordFields, { exclude: ['all'] }),
    workRuleController.updateWorkRule,
  );

// Routes for admins only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(filterQuery, workRuleController.getAllWorkRules)
  .post(checkRecordFields(recordFields), workRuleController.createWorkRule);

router.route('/:id').delete(workRuleController.deleteWorkRule);

export default router;
