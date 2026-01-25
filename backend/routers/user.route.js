import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as userController from '../controllers/user.controller.js';
import * as appValidators from '../middleware/app-validators.js';

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post(
  '/reset-password/:code',
  appValidators.validatePasswordReset,
  authController.resetPassword,
);

// Routes for logged in users
router.use(authController.protect);

router.route('/me').get(userController.getUser).patch(userController.updateMe);

router.patch(
  '/me/password',
  appValidators.validateNewPassword,
  authController.updatePassword,
);

// Routes for admins only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(appValidators.validateUserData, userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route('/:id/password')
  .patch(appValidators.validateNewPassword, authController.updateUserPassword);

export default router;
