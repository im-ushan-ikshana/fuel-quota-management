import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createLogger } from '../utils/logger';
import AuthRepository, { CreateUserData, UserWithRelations, SessionData, CreateAddressData } from '../repositories/auth.repo';
import SmsService from './sms.services';
import { UserType, District, Province } from '@prisma/client';

const logger = createLogger('AuthService');

export interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber: string;
  userType: UserType;
  address: CreateAddressData;
}

export interface LoginData {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<UserWithRelations, 'password'>;
  token?: string;
  sessionId?: string;
}

export interface VerificationData {
  userId: string;
  code: string;
  type: 'email' | 'phone';
}

export interface PasswordResetData {
  email?: string;
  code?: number;
  phoneNumber?: string;
  newPassword?: string;
  resetCode?: string;
}

class AuthService {
  private authRepository: AuthRepository;
  private smsService?: SmsService;
  private verificationCodes: Map<string, { code: string; expiresAt: Date; type: string }> = new Map();

  constructor() {
    this.authRepository = new AuthRepository();
    try {
      this.smsService = new SmsService();
    } catch (error) {
      logger.warn('SMS service not available:', error);
    }
  }

  /**
   * Register a new user
   */
  async registerUser(userData: RegisterUserData, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.authRepository.checkUserExists(
        userData.email,
        userData.phoneNumber,
        userData.nicNumber
      );

      if (existingUser.emailExists) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      if (existingUser.phoneExists) {
        return {
          success: false,
          message: 'User with this phone number already exists'
        };
      }

      if (existingUser.nicExists) {
        return {
          success: false,
          message: 'User with this NIC number already exists'
        };
      }

      // Create address first
      const address = await this.authRepository.createAddress(userData.address);

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const createUserData: CreateUserData = {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        nicNumber: userData.nicNumber,
        userType: userData.userType,
        addressId: address.id
      };

      const user = await this.authRepository.createUser(createUserData);

      // Generate verification codes
      await this.sendEmailVerification(user.id, user.email);
      await this.sendPhoneVerification(user.id, user.phoneNumber);

      // Send welcome SMS
      if (this.smsService) {
        await this.smsService.sendWelcomeSms(user.phoneNumber, user.firstName);
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'User registered successfully. Please verify your email and phone number.',
        user: userWithoutPassword
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Login user
   */
  async loginUser(loginData: LoginData, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      let user: UserWithRelations | null = null;

      // Find user by email or phone
      if (loginData.email) {
        user = await this.authRepository.findUserByEmail(loginData.email);
      } else if (loginData.phoneNumber) {
        user = await this.authRepository.findUserByPhoneNumber(loginData.phoneNumber);
      }

      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Update last login
      await this.authRepository.updateLastLogin(user.id);

      // Create session
      const sessionData: SessionData = {
        userId: user.id,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      const session = await this.authRepository.createSession(sessionData);

      // Generate JWT token
      const token = this.generateToken(user.id, session.sessionId);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        token,
        sessionId: session.sessionId
      };
    } catch (error) {
      logger.error('Error logging in user:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Logout user
   */
  async logoutUser(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.authRepository.invalidateSession(sessionId);
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      logger.error('Error logging out user:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  /**
   * Verify JWT token and session
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: UserWithRelations; sessionId?: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      const session = await this.authRepository.findSessionById(decoded.sessionId);
      if (!session) {
        return { valid: false };
      }

      // Update session last accessed
      await this.authRepository.updateSessionLastAccessed(decoded.sessionId);

      return {
        valid: true,
        user: session.user,
        sessionId: decoded.sessionId
      };
    } catch (error) {
      logger.error('Token verification failed:', error);
      return { valid: false };
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(userId: string, email: string): Promise<{ success: boolean; message: string }> {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      this.verificationCodes.set(`email_${userId}`, { code, expiresAt, type: 'email' });

      // TODO: Implement email sending service
      logger.info(`Email verification code for ${email}: ${code}`);

      return {
        success: true,
        message: 'Verification code sent to email'
      };
    } catch (error) {
      logger.error('Error sending email verification:', error);
      return {
        success: false,
        message: 'Failed to send verification code'
      };
    }
  }

  /**
   * Send phone verification
   */
  async sendPhoneVerification(userId: string, phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      this.verificationCodes.set(`phone_${userId}`, { code, expiresAt, type: 'phone' });

      // Send SMS
      if (this.smsService) {
        const result = await this.smsService.sendVerificationCode(phoneNumber, code);
        if (!result.success) {
          return {
            success: false,
            message: 'Failed to send SMS verification code'
          };
        }
      }

      return {
        success: true,
        message: 'Verification code sent to phone'
      };
    } catch (error) {
      logger.error('Error sending phone verification:', error);
      return {
        success: false,
        message: 'Failed to send verification code'
      };
    }
  }

  /**
   * Verify email or phone
   */
  async verifyCode(verificationData: VerificationData): Promise<{ success: boolean; message: string }> {
    try {
      const key = `${verificationData.type}_${verificationData.userId}`;
      const storedData = this.verificationCodes.get(key);

      if (!storedData) {
        return {
          success: false,
          message: 'Invalid or expired verification code'
        };
      }

      if (new Date() > storedData.expiresAt) {
        this.verificationCodes.delete(key);
        return {
          success: false,
          message: 'Verification code has expired'
        };
      }

      if (storedData.code !== verificationData.code) {
        return {
          success: false,
          message: 'Invalid verification code'
        };
      }

      // Update verification status
      if (verificationData.type === 'email') {
        await this.authRepository.updateEmailVerification(verificationData.userId, true);
      } else {
        await this.authRepository.updatePhoneVerification(verificationData.userId, true);
      }

      this.verificationCodes.delete(key);

      return {
        success: true,
        message: `${verificationData.type} verified successfully`
      };
    } catch (error) {
      logger.error('Error verifying code:', error);
      return {
        success: false,
        message: 'Verification failed'
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(resetData: Pick<PasswordResetData, 'email' | 'phoneNumber'>): Promise<{ success: boolean; message: string }> {
    try {
      let user: UserWithRelations | null = null;

      if (resetData.email) {
        user = await this.authRepository.findUserByEmail(resetData.email);
      } else if (resetData.phoneNumber) {
        user = await this.authRepository.findUserByPhoneNumber(resetData.phoneNumber);
      }

      if (!user) {
        // Don't reveal if user exists or not
        return {
          success: true,
          message: 'If the account exists, a reset code has been sent'
        };
      }

      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      this.verificationCodes.set(`reset_${user.id}`, { code, expiresAt, type: 'reset' });

      // Send reset code via SMS
      if (this.smsService) {
        await this.smsService.sendPasswordResetCode(user.phoneNumber, code);
      }

      return {
        success: true,
        message: 'Password reset code sent'
      };
    } catch (error) {
      logger.error('Error requesting password reset:', error);
      return {
        success: false,
        message: 'Failed to send reset code'
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(resetData: Required<PasswordResetData>): Promise<{ success: boolean; message: string }> {
    try {
      let user: UserWithRelations | null = null;

      if (resetData.email) {
        user = await this.authRepository.findUserByEmail(resetData.email);
      } else if (resetData.phoneNumber) {
        user = await this.authRepository.findUserByPhoneNumber(resetData.phoneNumber);
      }

      if (!user) {
        return {
          success: false,
          message: 'Invalid request'
        };
      }

      const key = `reset_${user.id}`;
      const storedData = this.verificationCodes.get(key);

      if (!storedData || storedData.code !== resetData.resetCode) {
        return {
          success: false,
          message: 'Invalid or expired reset code'
        };
      }

      if (new Date() > storedData.expiresAt) {
        this.verificationCodes.delete(key);
        return {
          success: false,
          message: 'Reset code has expired'
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(resetData.newPassword, 12);
      await this.authRepository.updateUserPassword(user.id, hashedPassword);

      this.verificationCodes.delete(key);

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      logger.error('Error resetting password:', error);
      return {
        success: false,
        message: 'Password reset failed'
      };
    }
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await this.authRepository.updateUserPassword(userId, hashedPassword);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      logger.error('Error changing password:', error);
      return {
        success: false,
        message: 'Password change failed'
      };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<{ success: boolean; user?: Omit<UserWithRelations, 'password'>; message: string }> {
    try {
      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      logger.error('Error getting user profile:', error);
      return {
        success: false,
        message: 'Failed to retrieve profile'
      };
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const deletedCount = await this.authRepository.deleteExpiredSessions();
      logger.info(`Cleaned up ${deletedCount} expired sessions`);
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, sessionId: string): string {
    return jwt.sign(
      { userId, sessionId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
  }

  /**
   * Generate verification code
   */
  private generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.authRepository.assignUserRole(userId, roleId);
      return {
        success: true,
        message: 'Role assigned successfully'
      };
    } catch (error) {
      logger.error('Error assigning role:', error);
      return {
        success: false,
        message: 'Failed to assign role'
      };
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.authRepository.removeUserRole(userId, roleId);
      return {
        success: true,
        message: 'Role removed successfully'
      };
    } catch (error) {
      logger.error('Error removing role:', error);
      return {
        success: false,
        message: 'Failed to remove role'
      };
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string) {
    try {
      return await this.authRepository.getUserRoles(userId);
    } catch (error) {
      logger.error('Error getting user roles:', error);
      throw error;
    }
  }
}

export default AuthService;