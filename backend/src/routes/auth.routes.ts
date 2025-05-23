import { Router, Request, Response, NextFunction } from "express";
import { createLogger } from '../utils/logger';
import AuthService, { RegisterUserData, LoginCredentials, ForgotPasswordData, ResetPasswordData } from '../services/auth.services';
import { UserType, District, Province } from '@prisma/client';

const authRouter = Router();
const logger = createLogger('AuthRoutes');

// Initialize auth service
const authService = new AuthService();

// Validation middleware
const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, firstName, lastName, phoneNumber, nicNumber, userType, address } = req.body;

  // Check required fields
  if (!email || !password || !firstName || !lastName || !phoneNumber || !nicNumber || !userType || !address) {
    res.status(400).json({
      success: false,
      message: 'All fields are required',
      required: ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'nicNumber', 'userType', 'address']
    });
    return;
  }

  // Validate email
  if (!authService.validateEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
    return;
  }

  // Validate password
  const passwordValidation = authService.validatePassword(password);
  if (!passwordValidation.isValid) {
    res.status(400).json({
      success: false,
      message: 'Password does not meet requirements',
      errors: passwordValidation.errors
    });
    return;
  }

  // Validate phone number
  if (!authService.validatePhoneNumber(phoneNumber)) {
    res.status(400).json({
      success: false,
      message: 'Invalid Sri Lankan phone number format'
    });
    return;
  }

  // Validate NIC number
  if (!authService.validateNicNumber(nicNumber)) {
    res.status(400).json({
      success: false,
      message: 'Invalid Sri Lankan NIC number format'
    });
    return;
  }

  // Validate user type
  if (!Object.values(UserType).includes(userType)) {
    res.status(400).json({
      success: false,
      message: 'Invalid user type',
      validTypes: Object.values(UserType)
    });
    return;
  }

  // Validate address
  if (!address.addressLine1 || !address.city || !address.district || !address.province) {
    res.status(400).json({
      success: false,
      message: 'Address must include addressLine1, city, district, and province'
    });
    return;
  }

  // Validate district and province enums
  if (!Object.values(District).includes(address.district)) {
    res.status(400).json({
      success: false,
      message: 'Invalid district',
      validDistricts: Object.values(District)
    });
    return;
  }

  if (!Object.values(Province).includes(address.province)) {
    res.status(400).json({
      success: false,
      message: 'Invalid province',
      validProvinces: Object.values(Province)
    });
    return;
  }

  next();
};

const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
    return;
  }

  if (!authService.validateEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
    return;
  }

  next();
};

// POST /api/auth/register - Register new account
authRouter.post('/register', validateRegistration, async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: RegisterUserData = req.body;
    
    logger.info(`Registration attempt for email: ${userData.email}`);
    
    const result = await authService.register(userData);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });

  } catch (error: any) {
    logger.error('Registration error:', error);
    
    // Handle specific validation errors
    if (error.message.includes('already exists')) {
      res.status(409).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
});

// POST /api/auth/login - Login
authRouter.post('/login', validateLogin, async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials: LoginCredentials = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    logger.info(`Login attempt for email: ${credentials.email}`);
    
    const result = await authService.login(credentials, ipAddress, userAgent);
    
    // Set HTTP-only cookie for refresh token (optional)
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn
      }
    });

  } catch (error: any) {
    logger.error('Login error:', error);
    
    // Handle specific authentication errors
    if (error.message.includes('Invalid email or password') || 
        error.message.includes('deactivated')) {
      res.status(401).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// POST /api/auth/logout - Logout
authRouter.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: 'Session ID is required in headers'
      });
      return;
    }
    
    await authService.logout(sessionId);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error: any) {
    logger.error('Logout error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.'
    });
  }
});

// POST /api/auth/forgot-password - Forgot password
authRouter.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: ForgotPasswordData = req.body;
    
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    if (!authService.validateEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
      return;
    }
    
    logger.info(`Password reset request for email: ${email}`);
    
    const result = await authService.forgotPassword({ email });
    
    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error: any) {
    logger.error('Forgot password error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request. Please try again.'
    });
  }
});

// POST /api/auth/reset-password - Reset password
authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword }: ResetPasswordData = req.body;
    
    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
      return;
    }

    // Validate new password
    const passwordValidation = authService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors
      });
      return;
    }
    
    logger.info('Password reset attempt');
    
    const result = await authService.resetPassword({ token, newPassword });
    
    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error: any) {
    logger.error('Reset password error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
});

// GET /api/auth/verify-token - Verify JWT token (for protected routes)
authRouter.get('/verify-token', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const user = await authService.verifyToken(token);
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          roles: user.userRoles?.map(ur => ur.role.name) || []
        }
      }
    });

  } catch (error: any) {
    logger.error('Token verification error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      res.status(401).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
});

// GET /api/auth/session/cleanup - Clean up expired sessions (admin endpoint)
authRouter.delete('/sessions/cleanup', async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add admin authentication middleware here
    
    const deletedCount = await authService.cleanupExpiredSessions();
    
    res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} expired sessions`
    });

  } catch (error: any) {
    logger.error('Session cleanup error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup sessions'
    });
  }
});

export default authRouter;
