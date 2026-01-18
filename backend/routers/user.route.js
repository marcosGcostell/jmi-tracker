import express from 'express';

import * as userController from '../controllers/user-controller.js';
import * as authController from '../controllers/auth-controller.js';

const router = express.Router();

router.post('/signup', userController.validateUserName, authController.signup);
router.post('/login', authController.login);
router.post(
  '/check',
  userController.validateUserName,
  userController.userExists,
);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers,
  )
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    userController.createUser,
  );

router
  .route('/me')
  .get(authController.protect, userController.getUser)
  .patch(
    authController.protect,
    userController.validateUserName,
    userController.validateUserData,
    userController.updateUser,
  )
  .delete(authController.protect, userController.deleteUser);

router.patch(
  '/me/password',
  authController.protect,
  authController.updatePassword,
);

export default router;
