import { Router } from "express";
import { authenticateJWT } from '../utils/jwt.middleware';
import { requirePermission } from '../utils/permissions';
import AuthController from '../controllers/auth.controller';

const authRouter = Router();
const authController = new AuthController();

/**
 * POST /api/auth/register
 * Register a new user
 */
authRouter.post('/register', authController.register.bind(authController));

/**
 * POST /api/auth/login
 * Authenticate user and generate JWT token
 */
authRouter.post('/login', authController.login.bind(authController));

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
authRouter.post('/logout', authenticateJWT, authController.logout.bind(authController));

/**
 * GET /api/auth/verify-token
 * Verify JWT token validity
 */
authRouter.get('/verify-token', authController.verifyToken.bind(authController));

/**
 * POST /api/auth/send-email-verification
 * Send email verification code
 */
authRouter.post('/send-email-verification', authenticateJWT, authController.sendEmailVerification.bind(authController));

/**
 * POST /api/auth/send-phone-verification
 * Send phone verification code
 */
authRouter.post('/send-phone-verification', authenticateJWT, authController.sendPhoneVerification.bind(authController));

/**
 * POST /api/auth/verify-code
 * Verify email or phone verification code
 */
authRouter.post('/verify-code', authenticateJWT, authController.verifyCode.bind(authController));

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
authRouter.post('/forgot-password', authController.forgotPassword.bind(authController));

/**
 * POST /api/auth/reset-password
 * Reset password with verification code
 */
authRouter.post('/reset-password', authController.resetPassword.bind(authController));

/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 */
authRouter.post('/change-password', authenticateJWT, authController.changePassword.bind(authController));

/**
 * GET /api/auth/profile
 * Get user profile information
 */
authRouter.get('/profile', authenticateJWT, authController.getProfile.bind(authController));

/**
 * POST /api/auth/assign-role
 * Assign role to user (Admin only)
 */
authRouter.post('/assign-role', 
  authenticateJWT, 
  requirePermission('user', 'update'), 
  authController.assignRole.bind(authController)
);

/**
 * POST /api/auth/remove-role
 * Remove role from user (Admin only)
 */
authRouter.post('/remove-role', 
  authenticateJWT, 
  requirePermission('user', 'update'), 
  authController.removeRole.bind(authController)
);

/**
 * GET /api/auth/user-roles/:userId
 * Get user roles (Admin only)
 */
authRouter.get('/user-roles/:userId', 
  authenticateJWT, 
  requirePermission('user', 'read'), 
  authController.getUserRoles.bind(authController)
);

/**
 * GET /api/auth/my-roles
 * Get current user's roles
 */
authRouter.get('/my-roles', authenticateJWT, authController.getMyRoles.bind(authController));

/**
 * DELETE /api/auth/sessions/cleanup
 * Clean up expired sessions (Admin only)
 */
authRouter.delete('/sessions/cleanup', 
  authenticateJWT, 
  requirePermission('admin', 'manage'), 
  authController.cleanupSessions.bind(authController)
);

/**
 * GET /api/auth/health
 * Health check endpoint
 */
authRouter.get('/health', authController.health.bind(authController));

export default authRouter;