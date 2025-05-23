import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createLogger } from '../utils/logger';
import AuthRepository, { CreateUserData, UserWithRelations } from '../repositories/auth.repo';
import { UserType, District, Province } from '@prisma/client';

const logger = createLogger('AuthService');

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Validate JWT secrets
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets must be defined in environment variables');
}

export interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber: string;
  userType: UserType;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: District;
    province: Province;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userType: UserType;
    isActive: boolean;
    emailVerified: boolean;
    roles: string[];
  };
  tokens: AuthTokens;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

class AuthService {
  private authRepository: AuthRepository;
  private readonly saltRounds = 12;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterUserData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.authRepository.checkUserExists(
        userData.email,
        userData.phoneNumber,
        userData.nicNumber
      );

      if (existingUser.emailExists) {
        throw new Error('User with this email already exists');
      }

      if (existingUser.phoneExists) {
        throw new Error('User with this phone number already exists');
      }

      if (existingUser.nicExists) {
        throw new Error('User with this NIC number already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create address first
      const address = await this.authRepository.createAddress(userData.address);

      // Prepare user data
      const userCreateData: CreateUserData = {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        nicNumber: userData.nicNumber,
        userType: userData.userType,
        addressId: address.id,
      };

      // Create user
      const user = await this.authRepository.createUser(userCreateData);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Create session
      const sessionExpiresAt = new Date();
      sessionExpiresAt.setHours(sessionExpiresAt.getHours() + 24); // 24 hours

      await this.authRepository.createSession({
        userId: user.id,
        expiresAt: sessionExpiresAt
      });

      logger.info(`User registered successfully: ${user.email}`);

      return {
        user: this.formatUserResponse(user),
        tokens
      };

    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.authRepository.findUserByEmail(credentials.email);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(credentials.password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await this.authRepository.updateLastLogin(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Create session
      const sessionExpiresAt = new Date();
      sessionExpiresAt.setHours(sessionExpiresAt.getHours() + 24); // 24 hours

      await this.authRepository.createSession({
        userId: user.id,
        ipAddress,
        userAgent,
        expiresAt: sessionExpiresAt
      });

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        user: this.formatUserResponse(user),
        tokens
      };

    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(sessionId: string): Promise<void> {
    try {
      await this.authRepository.invalidateSession(sessionId);
      logger.info(`User logged out: session ${sessionId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Forgot password - generate reset token and send email
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      // Find user by email
      const user = await this.authRepository.findUserByEmail(data.email);

      if (!user) {
        // For security, we don't reveal if the email exists or not
        return { message: 'If the email exists, a password reset link has been sent.' };
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { 
          userId: user.id, 
          type: 'password_reset',
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '1h' } as jwt.SignOptions
      );

      // TODO: Send email with reset token
      // Here you would integrate with your email service (SendGrid, etc.)
      // For now, we'll just log it
      logger.info(`Password reset token generated for ${user.email}: ${resetToken}`);

      // In production, you would send this via email
      // await emailService.sendPasswordResetEmail(user.email, resetToken);

      return { message: 'If the email exists, a password reset link has been sent.' };

    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {      // Verify reset token
      const decoded = jwt.verify(data.token, JWT_SECRET) as any;

      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      // Find user
      const user = await this.authRepository.findUserById(decoded.userId);

      if (!user) {
        throw new Error('Invalid reset token');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(data.newPassword);

      // Update password
      await this.authRepository.updateUserPassword(user.id, hashedPassword);

      logger.info(`Password reset successfully for user: ${user.email}`);

      return { message: 'Password has been reset successfully.' };

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid or expired reset token');
      }
      logger.error('Reset password error:', error);
      throw error;
    }
  }
  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<UserWithRelations> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const user = await this.authRepository.findUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('Invalid token or user not found');
      }

      return user;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid or expired token');
      }
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const deletedCount = await this.authRepository.deleteExpiredSessions();
      logger.info(`Cleaned up ${deletedCount} expired sessions`);
      return deletedCount;
    } catch (error) {
      logger.error('Session cleanup error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify password
   */
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: UserWithRelations): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      roles: user.userRoles?.map(ur => ur.role.name) || []
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN 
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' }, 
      JWT_REFRESH_SECRET, 
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN
    };
  }

  /**
   * Format user response (remove sensitive data)
   */
  private formatUserResponse(user: UserWithRelations) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      roles: user.userRoles?.map(ur => ur.role.name) || []
    };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Sri Lankan phone number
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Sri Lankan phone number pattern: +94XXXXXXXXX or 0XXXXXXXXX
    const phoneRegex = /^(\+94|0)[1-9]\d{8}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  /**
   * Validate Sri Lankan NIC number
   */
  validateNicNumber(nicNumber: string): boolean {
    // Old format: 9 digits + V (e.g., 123456789V)
    // New format: 12 digits (e.g., 199812345678)
    const oldNicRegex = /^\d{9}[VvXx]$/;
    const newNicRegex = /^\d{12}$/;
    
    return oldNicRegex.test(nicNumber) || newNicRegex.test(nicNumber);
  }
}

export default AuthService;