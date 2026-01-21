import express from 'express';

import * as userController from '../controllers/user.controller.js';
import * as authController from '../controllers/auth.controller.js';
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

router
  .route('/me')
  .get(userController.getUser)
  .patch(
    userController.validateUserName,
    userController.validateUserData,
    userController.updateUser,
  )
  .delete(authController.protect, userController.deleteUser);

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

export default router;
