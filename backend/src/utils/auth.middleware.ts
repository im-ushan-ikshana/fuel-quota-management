import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import PrismaService from '@/services/prisma.services';
import { logger } from './logger';
import { AuthenticatedRequest } from './permissions';

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Interface for JWT payload
interface JWTPayload {
  userId: string;
  email: string;
  userType: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

// Interface for authentication headers
interface AuthHeaders {
  authorization?: string;
  'x-user-id'?: string;
  'x-user-role'?: string;
  'x-session-id'?: string;
}

// Interface for user with roles (from Prisma query)
interface UserWithRoles {
  id: string;
  email: string;
  userType: any; // UserType enum
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  addressId: string;
  userRoles: {
    id: string;
    userId: string;
    roleId: string;
    assignedAt: Date;
    isActive: boolean;
    role: {
      id: string;
      name: string;
      description: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
}

/**
 * Extract JWT token from Authorization header
 * @param authHeader - Authorization header value
 * @returns JWT token string or null
 */
const extractJWTToken = (authHeader: string): string | null => {
  if (!authHeader) return null;
  
  // Support both "Bearer <token>" and "<token>" formats
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  
  return null;
};

/**
 * Verify JWT token and extract payload
 * @param token - JWT token string
 * @returns Decoded JWT payload or null
 */
const verifyJWTToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.warn('JWT verification failed:', error);
    return null;
  }
};

/**
 * Validate session in database
 * @param sessionId - Session ID from headers
 * @param userId - User ID from JWT or headers
 * @returns Boolean indicating if session is valid
 */
const validateSession = async (sessionId: string, userId: string): Promise<boolean> => {
  try {
    const prismaService = PrismaService.getInstance();
    const prisma = prismaService.getClient();

    const session = await prisma.session.findUnique({
      where: { sessionId },
      include: { user: true }
    });

    if (!session) {
      logger.warn(`Session not found: ${sessionId}`);
      return false;
    }

    // Check if session is active
    if (!session.isActive) {
      logger.warn(`Session is inactive: ${sessionId}`);
      return false;
    }

    // Check if session has expired
    if (session.expiresAt < new Date()) {
      logger.warn(`Session has expired: ${sessionId}`);
      return false;
    }

    // Check if session belongs to the user
    if (session.userId !== userId) {
      logger.warn(`Session user mismatch: ${sessionId} does not belong to user ${userId}`);
      return false;
    }

    // Check if user is active
    if (!session.user.isActive) {
      logger.warn(`User is inactive: ${userId}`);
      return false;
    }

    // Update last accessed time
    await prisma.session.update({
      where: { sessionId },
      data: { lastAccessedAt: new Date() }
    });

    return true;
  } catch (error) {
    logger.error('Session validation error:', error);
    return false;
  }
};

/**
 * Get user details from database
 * @param userId - User ID
 * @returns User object or null
 */
const getUserDetails = async (userId: string) => {
  try {
    const prismaService = PrismaService.getInstance();
    const prisma = prismaService.getClient();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: true
          }
        }
      }
    });

    return user;
  } catch (error) {
    logger.error('Error fetching user details:', error);
    return null;
  }
};

/**
 * Main authentication middleware
 * Validates JWT token, headers, and session
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const headers = req.headers as AuthHeaders;
    
    // Extract required headers
    const authHeader = headers.authorization;
    const userIdHeader = headers['x-user-id'];
    const userRoleHeader = headers['x-user-role'];
    const sessionIdHeader = headers['x-session-id'];

    // Check if Authorization header is present
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Authorization header is required',
        code: 'MISSING_AUTH_HEADER'
      });
      return;
    }

    // Extract and verify JWT token
    const token = extractJWTToken(authHeader);
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization header format',
        code: 'INVALID_AUTH_FORMAT'
      });
      return;
    }

    // Verify JWT token
    const jwtPayload = verifyJWTToken(token);
    if (!jwtPayload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired JWT token',
        code: 'INVALID_JWT'
      });
      return;
    }

    // Check if required headers are present
    if (!userIdHeader || !sessionIdHeader) {
      res.status(400).json({
        success: false,
        message: 'Missing required headers: x-user-id and x-session-id are required',
        code: 'MISSING_REQUIRED_HEADERS'
      });
      return;
    }

    // Validate that JWT userId matches header userId
    if (jwtPayload.userId !== userIdHeader) {
      res.status(401).json({
        success: false,
        message: 'User ID mismatch between JWT and headers',
        code: 'USER_ID_MISMATCH'
      });
      return;
    }

    // Validate that JWT sessionId matches header sessionId
    if (jwtPayload.sessionId !== sessionIdHeader) {
      res.status(401).json({
        success: false,
        message: 'Session ID mismatch between JWT and headers',
        code: 'SESSION_ID_MISMATCH'
      });
      return;
    }

    // Validate session in database
    const isSessionValid = await validateSession(sessionIdHeader, userIdHeader);
    if (!isSessionValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
        code: 'INVALID_SESSION'
      });
      return;
    }

    // Get user details from database
    const user = await getUserDetails(userIdHeader);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }    // Validate role if provided in headers
    if (userRoleHeader) {
      const userHasRole = user.userRoles.some((userRole: any) => 
        userRole.role.name === userRoleHeader
      );
      
      if (!userHasRole) {
        logger.warn(`Role mismatch for user ${userIdHeader}: expected ${userRoleHeader}`);
        res.status(403).json({
          success: false,
          message: 'Role mismatch',
          code: 'ROLE_MISMATCH'
        });
        return;
      }
    }

    // Attach user information to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      phoneNumber: user.phoneNumber,
      nicNumber: user.nicNumber,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      sessionId: sessionIdHeader,      roles: user.userRoles.map((userRole: any) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        description: userRole.role.description
      }))
    };

    // Log successful authentication
    logger.info(`User authenticated successfully: ${user.email} (${user.id})`);

    // Proceed to next middleware
    next();

  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't fail if no auth headers are provided
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const headers = req.headers as AuthHeaders;
    const authHeader = headers.authorization;

    // If no auth header, continue without authentication
    if (!authHeader) {
      next();
      return;
    }

    // If auth header is present, perform full authentication
    await authenticate(req, res, next);

  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next(); // Continue even if authentication fails
  }
};

/**
 * Middleware to require specific user types
 * @param allowedUserTypes - Array of allowed user types
 * @returns Express middleware function
 */
export const requireUserType = (allowedUserTypes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (!allowedUserTypes.includes(req.user.userType)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required user type: ${allowedUserTypes.join(' or ')}`,
        code: 'INSUFFICIENT_USER_TYPE',
        required: allowedUserTypes,
        current: req.user.userType
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is active
 */
export const requireActiveUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  if (!req.user.isActive) {
    res.status(403).json({
      success: false,
      message: 'Account is inactive',
      code: 'INACTIVE_ACCOUNT'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user's email is verified
 */
export const requireEmailVerified = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  if (!req.user.emailVerified) {
    res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
    return;
  }

  next();
};

/**
 * Export interfaces and utilities
 */
export { JWTPayload, AuthHeaders };

/*
 * USAGE EXAMPLES:
 * 
 * 1. Basic authentication:
 * app.use('/api/protected', authenticate);
 * 
 * 2. Optional authentication:
 * app.use('/api/public', optionalAuthenticate);
 * 
 * 3. Require specific user type:
 * app.use('/api/admin', authenticate, requireUserType(['ADMIN_USER']));
 * 
 * 4. Require active user:
 * app.use('/api/user', authenticate, requireActiveUser);
 * 
 * 5. Require verified email:
 * app.use('/api/verified', authenticate, requireEmailVerified);
 * 
 * 6. Combined middleware:
 * app.use('/api/fuel-station', 
 *   authenticate, 
 *   requireActiveUser,
 *   requireUserType(['FUEL_STATION_OWNER', 'FUEL_STATION_OPERATOR'])
 * );
 * 
 * REQUIRED HEADERS:
 * - Authorization: Bearer <jwt-token>
 * - x-user-id: <user-id>
 * - x-session-id: <session-id>
 * - x-user-role: <role-name> (optional)
 */