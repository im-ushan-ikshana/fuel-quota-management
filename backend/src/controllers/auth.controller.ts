import { Request, Response } from "express";
import { AuthenticatedRequest } from '../utils/permissions';
import AuthService, { RegisterUserData, LoginData, VerificationData, PasswordResetData, CreateOperatorData } from '../services/auth.services';
import { createLogger } from '../utils/logger';
import { UserType, District, Province } from '@prisma/client';

export class AuthController {
  private authService: AuthService;
  private logger: any;

  constructor() {
    this.authService = new AuthService();
    this.logger = createLogger('AuthController');
  }

  // Validation helper methods
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
    }
    return { valid: true };
  }

  private validatePhoneNumber(phone: string): boolean {
    // Sri Lankan phone number validation
    const phoneRegex = /^(\+94|0)?[1-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  private validateNIC(nic: string): boolean {
    // Sri Lankan NIC validation
    const oldNicRegex = /^[0-9]{9}[vVxX]$/;
    const newNicRegex = /^[0-9]{12}$/;
    return oldNicRegex.test(nic) || newNicRegex.test(nic);
  }

  private getClientInfo(req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'];
    return { ipAddress, userAgent };
  }

  /**
   * Register a new user
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        nicNumber,
        userType,
        address
      }: RegisterUserData = req.body;

      // Validate required fields
      let requiredFields = {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        nicNumber,
        userType,
        address
      };

      const missingFields = Object.entries(requiredFields).filter(([key, value]) => !value);
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.map(([key]) => key).join(', ')}`
        });
        return;
      }      // Validate user type is one of the allowed types
      if (!Object.values(UserType).includes(userType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
        return;
      }
      
      // Currently only supporting FUEL_STATION_OWNER and VEHICLE_OWNER registrations
      if (userType !== UserType.FUEL_STATION_OWNER && userType !== UserType.VEHICLE_OWNER) {
        res.status(400).json({
          success: false,
          message: 'Only Fuel Station Owners and Vehicle Owners can register'
        });
        return;
      }
      
      if (userType === UserType.FUEL_STATION_OWNER) {
        if (!req.body.stationInfo) {
          res.status(400).json({
            success: false,
            message: 'Fuel station information is required for Fuel Station Owners'
          });
          return;
        }
      }
      
      if (userType === UserType.VEHICLE_OWNER) {
        if (!req.body.vehicleInfo) {
          res.status(400).json({
            success: false,
            message: 'Vehicle information is required for Vehicle Owners'
          });
          return;
        }
      }

      // Validate email format
      if (!this.validateEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      // Validate password strength
      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.valid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
        return;
      }

      // Validate phone number
      if (!this.validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid Sri Lankan phone number format'
        });
        return;
      }

      // Validate NIC number
      if (!this.validateNIC(nicNumber)) {
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
          message: 'Invalid user type'
        });
        return;
      }

      // Validate address
      if (!address.city || !address.district || !address.province) {
        res.status(400).json({
          success: false,
          message: 'Complete address information is required'
        });
        return;
      }      // Validate district and province
      if (!Object.values(District).includes(address.district)) {
        res.status(400).json({
          success: false,
          message: 'Invalid district'
        });
        return;
      }

      if (!Object.values(Province).includes(address.province)) {
        res.status(400).json({
          success: false,
          message: 'Invalid province'
        });
        return;
      }      // Get client IP and user agent
      const { ipAddress, userAgent } = this.getClientInfo(req);
      
      // Process the registration
      const result = await this.authService.registerUser(req.body, ipAddress, userAgent);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: {
            user: result.user,
            token: result.token,
            sessionId: result.sessionId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error registering user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  /**
   * Authenticate user and generate JWT token
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, phoneNumber, password }: LoginData = req.body;

      // Validate that either email or phone is provided
      if (!email && !phoneNumber) {
        res.status(400).json({
          success: false,
          message: 'Email or phone number is required'
        });
        return;
      }

      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password is required'
        });
        return;
      }

      // Validate email format if provided
      if (email && !this.validateEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      // Validate phone number format if provided
      if (phoneNumber && !this.validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
        return;
      }

      // Get client IP and user agent
      const { ipAddress, userAgent } = this.getClientInfo(req);

      // Attempt login
      const result = await this.authService.loginUser(req.body, ipAddress, userAgent);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user: result.user,
            accessToken: result.token,
            sessionId: result.sessionId,
            expiresIn: '24h'
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error logging in user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  /**
   * Logout user and invalidate session
   */
  public async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sessionId = req.headers['x-session-id'] as string;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
        return;
      }

      const result = await this.authService.logoutUser(sessionId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error logging out user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  }

  /**
   * Verify JWT token validity
   */
  public async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: 'Authorization header is required'
        });
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      const result = await this.authService.verifyToken(token);

      if (result.valid) {
        res.status(200).json({
          success: true,
          message: 'Token is valid',
          data: {
            user: result.user,
            sessionId: result.sessionId
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

    } catch (error) {
      this.logger.error('Error verifying token:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token verification'
      });
    }
  }

  /**
   * Send email verification code
   */
  public async sendEmailVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { email } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found'
        });
        return;
      }

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      if (!this.validateEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      const result = await this.authService.sendEmailVerification(userId, email);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error sending email verification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while sending email verification'
      });
    }
  }

  /**
   * Send phone verification code
   */
  public async sendPhoneVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { phoneNumber } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found'
        });
        return;
      }

      if (!phoneNumber) {
        res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
        return;
      }

      if (!this.validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
        return;
      }

      const result = await this.authService.sendPhoneVerification(userId, phoneNumber);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error sending phone verification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while sending phone verification'
      });
    }
  }

  /**
   * Verify email or phone verification code
   */
  public async verifyCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { code, type }: VerificationData = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found'
        });
        return;
      }

      if (!code || !type) {
        res.status(400).json({
          success: false,
          message: 'Verification code and type are required'
        });
        return;
      }

      if (!['email', 'phone'].includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid verification type. Must be "email" or "phone"'
        });
        return;
      }

      const verificationData: VerificationData = {
        userId,
        code,
        type
      };

      const result = await this.authService.verifyCode(verificationData);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error verifying code:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during code verification'
      });
    }
  }

  /**
   * Request password reset
   */
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, phoneNumber } = req.body;

      if (!email && !phoneNumber) {
        res.status(400).json({
          success: false,
          message: 'Email or phone number is required'
        });
        return;
      }

      if (email && !this.validateEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      if (phoneNumber && !this.validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
        return;
      }

      const result = await this.authService.requestPasswordReset({ email, phoneNumber });

      // Always return success for security reasons (don't reveal if user exists)
      res.status(200).json({
        success: true,
        message: 'If an account with that email/phone exists, a password reset code has been sent'
      });

    } catch (error) {
      this.logger.error('Error requesting password reset:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while requesting password reset'
      });
    }
  }

  /**
   * Reset password with verification code
   */
  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, phoneNumber, code, newPassword } = req.body;

      if (!email && !phoneNumber) {
        res.status(400).json({
          success: false,
          message: 'Email or phone number is required'
        });
        return;
      }

      if (!code || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Verification code and new password are required'
        });
        return;
      }

      if (email && !this.validateEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      if (phoneNumber && !this.validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
        return;
      }

      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
        return;
      }

      const resetData: Required<PasswordResetData> = {
        email: email || '',
        code: 0, // This field seems unused in the service
        phoneNumber: phoneNumber || '',
        newPassword: newPassword,
        resetCode: code
      };

      const result = await this.authService.resetPassword(resetData);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error resetting password:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during password reset'
      });
    }
  }

  /**
   * Change password for authenticated user
   */
  public async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found'
        });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
        return;
      }

      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
        return;
      }

      const result = await this.authService.changePassword(userId, currentPassword, newPassword);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during password change'
      });
    }
  }

  /**
   * Get user profile information
   */
  public async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found'
        });
        return;
      }

      const result = await this.authService.getUserProfile(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user: result.user
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error getting user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving profile'
      });
    }
  }

  /**
   * Assign role to user (Admin only)
   */
  public async assignRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.body;

      if (!userId || !roleId) {
        res.status(400).json({
          success: false,
          message: 'User ID and role ID are required'
        });
        return;
      }

      const result = await this.authService.assignRole(userId, roleId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error assigning role:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while assigning role'
      });
    }
  }

  /**
   * Remove role from user (Admin only)
   */
  public async removeRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.body;

      if (!userId || !roleId) {
        res.status(400).json({
          success: false,
          message: 'User ID and role ID are required'
        });
        return;
      }

      const result = await this.authService.removeRole(userId, roleId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      this.logger.error('Error removing role:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while removing role'
      });
    }
  }

  /**
   * Get user roles (Admin only)
   */
  public async getUserRoles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const roles = await this.authService.getUserRoles(userId);

      res.status(200).json({
        success: true,
        message: 'User roles retrieved successfully',
        data: {
          userId,
          roles
        }
      });

    } catch (error) {
      this.logger.error('Error getting user roles:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving user roles'
      });
    }
  }

  /**
   * Get current user's roles
   */
  public async getMyRoles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found'
        });
        return;
      }

      const roles = await this.authService.getUserRoles(userId);

      res.status(200).json({
        success: true,
        message: 'User roles retrieved successfully',
        data: {
          roles
        }
      });

    } catch (error) {
      this.logger.error('Error getting current user roles:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving roles'
      });
    }
  }

  /**
   * Clean up expired sessions (Admin only)
   */
  public async cleanupSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await this.authService.cleanupExpiredSessions();

      res.status(200).json({
        success: true,
        message: 'Expired sessions cleaned up successfully'
      });    } catch (error) {
      this.logger.error('Error cleaning up sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during session cleanup'
      });
    }
  }

  /**
   * Create fuel station operator (Admin only)
   */
  public async createOperator(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verify user is authenticated and is an admin
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (req.user.userType !== UserType.ADMIN_USER) {
        res.status(403).json({
          success: false,
          message: 'Only admin users can create fuel station operators'
        });
        return;
      }

      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        nicNumber,
        address,
        employeeId,
        fuelStationId
      }: CreateOperatorData = req.body;

      // Validate required fields
      const requiredFields = {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        nicNumber,
        address,
        employeeId,
        fuelStationId
      };

      const missingFields = Object.entries(requiredFields).filter(([key, value]) => !value);
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.map(([key]) => key).join(', ')}`
        });
        return;
      }

      // Validate email format
      if (!this.validateEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      // Validate password strength
      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.valid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
        return;
      }

      // Validate phone number
      if (!this.validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid Sri Lankan phone number format'
        });
        return;
      }

      // Validate NIC
      if (!this.validateNIC(nicNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid Sri Lankan NIC number format'
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

      // Validate district and province are valid enum values
      if (!Object.values(District).includes(address.district)) {
        res.status(400).json({
          success: false,
          message: 'Invalid district'
        });
        return;
      }

      if (!Object.values(Province).includes(address.province)) {
        res.status(400).json({
          success: false,
          message: 'Invalid province'
        });
        return;
      }

      // Get client info for session
      const { ipAddress, userAgent } = this.getClientInfo(req);

      // Create the operator
      const result = await this.authService.createOperator(
        {
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
          nicNumber,
          address,
          employeeId,
          fuelStationId
        },
        ipAddress,
        userAgent
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      this.logger.info(`Admin ${req.user.email} created fuel station operator: ${email}`);      res.status(201).json({
        success: true,
        message: result.message,
        user: {
          id: result.user!.id,
          email: result.user!.email,
          firstName: result.user!.firstName,
          lastName: result.user!.lastName,
          phoneNumber: result.user!.phoneNumber,
          userType: result.user!.userType,
          emailVerified: result.user!.emailVerified,
          phoneVerified: result.user!.phoneVerified
        }
      });

    } catch (error) {
      this.logger.error('Error in createOperator:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during operator creation'
      });
    }
  }

  /**
   * Health check endpoint
   */
  public async health(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Authentication service is healthy',
      timestamp: new Date().toISOString()
    });
  }
}

export default AuthController;