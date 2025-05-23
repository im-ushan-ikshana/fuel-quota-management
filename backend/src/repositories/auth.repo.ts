import PrismaService from '../services/prisma.services';
import { handlePrismaError } from '../utils/prisma.middleware';
import { createLogger } from '../utils/logger';
import { UserType, RegistrationStatus, District, Province } from '@prisma/client';

const logger = createLogger('AuthRepository');

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber: string;
  userType: UserType;
  addressId: string;
}

export interface UserWithRelations {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber: string;
  userType: UserType;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  addressId: string;
  address?: {
    id: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    district: string;
    province: string;
  };
  userRoles?: {
    id: string;
    userId: string;
    roleId: string;
    assignedAt: Date;
    isActive: boolean;
    role: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
}

export interface SessionData {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

class AuthRepository {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<UserWithRelations | null> {
    try {
      const prisma = this.prismaService.getClient();
      
      return await prisma.user.findUnique({
        where: { email },
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw handlePrismaError(error, 'finding user by email');
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(userId: string): Promise<UserWithRelations | null> {
    try {
      const prisma = this.prismaService.getClient();
      
      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw handlePrismaError(error, 'finding user by ID');
    }
  }

  /**
   * Find user by phone number
   */
  async findUserByPhoneNumber(phoneNumber: string): Promise<UserWithRelations | null> {
    try {
      const prisma = this.prismaService.getClient();
      
      return await prisma.user.findUnique({
        where: { phoneNumber },
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding user by phone number:', error);
      throw handlePrismaError(error, 'finding user by phone number');
    }
  }

  /**
   * Find user by NIC number
   */
  async findUserByNic(nicNumber: string): Promise<UserWithRelations | null> {
    try {
      const prisma = this.prismaService.getClient();
      
      return await prisma.user.findUnique({
        where: { nicNumber },
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding user by NIC:', error);
      throw handlePrismaError(error, 'finding user by NIC number');
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<UserWithRelations> {
    try {
      const prisma = this.prismaService.getClient();
      
      return await prisma.user.create({
        data: userData,
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      throw handlePrismaError(error, 'creating user');
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();
      
      await prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating user password:', error);
      throw handlePrismaError(error, 'updating user password');
    }
  }

  /**
   * Update user last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();
      
      await prisma.user.update({
        where: { id: userId },
        data: { 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw handlePrismaError(error, 'updating last login time');
    }
  }

  /**
   * Update email verification status
   */
  async updateEmailVerification(userId: string, verified: boolean): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();
      
      await prisma.user.update({
        where: { id: userId },
        data: { 
          emailVerified: verified,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating email verification:', error);
      throw handlePrismaError(error, 'updating email verification');
    }
  }

  /**
   * Create a new session
   */
  async createSession(sessionData: SessionData): Promise<{ sessionId: string }> {
    try {
      const prisma = this.prismaService.getClient();
      
      const session = await prisma.session.create({
        data: sessionData
      });

      return { sessionId: session.sessionId };
    } catch (error) {
      logger.error('Error creating session:', error);
      throw handlePrismaError(error, 'creating session');
    }
  }

  /**
   * Find session by session ID
   */
  async findSessionById(sessionId: string) {
    try {
      const prisma = this.prismaService.getClient();
      
      return await prisma.session.findUnique({
        where: { sessionId },
        include: {
          user: {
            include: {
              address: true,
              userRoles: {
                where: { isActive: true },
                include: {
                  role: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding session:', error);
      throw handlePrismaError(error, 'finding session');
    }
  }

  /**
   * Update session last accessed time
   */
  async updateSessionLastAccessed(sessionId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();
      
      await prisma.session.update({
        where: { sessionId },
        data: { lastAccessedAt: new Date() }
      });
    } catch (error) {
      logger.error('Error updating session last accessed:', error);
      throw handlePrismaError(error, 'updating session last accessed time');
    }
  }

  /**
   * Invalidate session (mark as inactive)
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();
      
      await prisma.session.update({
        where: { sessionId },
        data: { isActive: false }
      });
    } catch (error) {
      logger.error('Error invalidating session:', error);
      throw handlePrismaError(error, 'invalidating session');
    }
  }

  /**
   * Delete expired sessions
   */
  async deleteExpiredSessions(): Promise<number> {
    try {
      const prisma = this.prismaService.getClient();
      
      const result = await prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false }
          ]
        }
      });

      return result.count;
    } catch (error) {
      logger.error('Error deleting expired sessions:', error);
      throw handlePrismaError(error, 'deleting expired sessions');
    }
  }
  /**
   * Create address (helper function for user registration)
   */
  async createAddress(addressData: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: District;
    province: Province;
  }) {
    try {
      const prisma = this.prismaService.getClient();
      
      return await prisma.address.create({
        data: addressData
      });
    } catch (error) {
      logger.error('Error creating address:', error);
      throw handlePrismaError(error, 'creating address');
    }
  }

  /**
   * Check if user exists by email, phone, or NIC
   */
  async checkUserExists(email: string, phoneNumber: string, nicNumber: string): Promise<{
    emailExists: boolean;
    phoneExists: boolean;
    nicExists: boolean;
  }> {
    try {
      const prisma = this.prismaService.getClient();
      
      const [emailCheck, phoneCheck, nicCheck] = await Promise.all([
        prisma.user.findUnique({ where: { email }, select: { id: true } }),
        prisma.user.findUnique({ where: { phoneNumber }, select: { id: true } }),
        prisma.user.findUnique({ where: { nicNumber }, select: { id: true } })
      ]);

      return {
        emailExists: !!emailCheck,
        phoneExists: !!phoneCheck,
        nicExists: !!nicCheck
      };
    } catch (error) {
      logger.error('Error checking user existence:', error);
      throw handlePrismaError(error, 'checking user existence');
    }
  }
}

export default AuthRepository;