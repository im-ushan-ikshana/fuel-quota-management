import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import PrismaService from '../services/prisma.services';
import { logger } from './logger';
import { AuthenticatedRequest } from './permissions';

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Interface for JWT payload
interface JWTPayload {
  userId: string;
  email: string;
  userType: string;
  roles: string[];
  iat?: number;
  exp?: number;
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
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
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
 * Simple JWT-only authentication middleware
 * Only validates JWT token without requiring additional headers
 */
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
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

    // Get user details from database
    const user = await getUserDetails(jwtPayload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account is deactivated',
        code: 'USER_INACTIVE'
      });
      return;
    }

    // Attach user information to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isActive: user.isActive,
      roles: user.userRoles?.map(ur => ur.role.name) || [],
      permissions: user.userRoles?.flatMap(ur => 
        ur.role.permissions?.map(rp => ({
          module: rp.permission.module,
          action: rp.permission.action
        })) || []
      ) || []
    };

    logger.info(`User authenticated successfully: ${user.email} (${user.id})`);
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
