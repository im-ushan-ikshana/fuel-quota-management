import PrismaService from "../services/prisma.services";
import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";
import { Request, Response, NextFunction } from "express";

/**
 * create permission checker for routes
 * @param {string} permission - The permission to check
 * @param {string} role - The role of the user
 * @param {string} userId - The ID of the user
 * @returns {boolean} - True if the user has the permission, false otherwise
 */

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: string;
    [key: string]: any;
  };
}

// Export the interface for use in other files
export { AuthenticatedRequest };

/**
 * Check if a user has a specific permission
 * @param userId - The ID of the user
 * @param module - The module to check permission for
 * @param action - The action to check permission for
 * @returns Promise<boolean> - True if user has permission, false otherwise
 */
export const checkUserPermission = async (
  userId: string,
  module: string,
  action: string
): Promise<boolean> => {
  try {
    const prismaService = PrismaService.getInstance();
    const prisma = prismaService.getClient();

    // Get user's roles and their permissions
    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
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

    if (!userWithRoles) {
      logger.warn(`User not found: ${userId}`);
      return false;
    }

    // Check if user is active
    if (!userWithRoles.isActive) {
      logger.warn(`User is inactive: ${userId}`);
      return false;
    }    // Check if user has the required permission (case-insensitive)
    const hasPermission = userWithRoles.userRoles.some((userRole: any) =>
      userRole.isActive &&
      userRole.role.permissions.some((rolePermission: any) =>
        rolePermission.permission.module.toLowerCase() === module.toLowerCase() &&
        rolePermission.permission.action.toLowerCase() === action.toLowerCase() &&
        rolePermission.permission.isActive
      )
    );

    logger.info(`Permission check for user ${userId}: ${module}.${action} = ${hasPermission}`);
    return hasPermission;

  } catch (error) {
    logger.error(`Error checking permission for user ${userId}:`, error);
    return false;
  }
};

/**
 * Middleware to check if user has required permission
 * @param module - The module to check permission for
 * @param action - The action to check permission for
 * @returns Express middleware function
 */
export const requirePermission = (module: string, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Authentication required"
        });
        return;
      }

      const userId = req.user.id;
      const hasPermission = await checkUserPermission(userId, module, action);

      if (!hasPermission) {
        logger.warn(`Access denied for user ${userId}: ${module}.${action}`);
        res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          required: `${module}.${action}`
        });
        return;
      }

      // User has permission, proceed to next middleware
      next();

    } catch (error) {
      logger.error("Permission middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during permission check"
      });
    }
  };
};

/**
 * Check if user has multiple permissions (AND logic)
 * @param userId - The ID of the user
 * @param permissions - Array of {module, action} objects
 * @returns Promise<boolean> - True if user has ALL permissions, false otherwise
 */
export const checkMultiplePermissions = async (
  userId: string,
  permissions: Array<{ module: string; action: string }>
): Promise<boolean> => {
  try {
    const permissionChecks = await Promise.all(
      permissions.map(perm => checkUserPermission(userId, perm.module, perm.action))
    );

    return permissionChecks.every(hasPermission => hasPermission);
  } catch (error) {
    logger.error(`Error checking multiple permissions for user ${userId}:`, error);
    return false;
  }
};

/**
 * Check if user has any of the specified permissions (OR logic)
 * @param userId - The ID of the user
 * @param permissions - Array of {module, action} objects
 * @returns Promise<boolean> - True if user has ANY permission, false otherwise
 */
export const checkAnyPermission = async (
  userId: string,
  permissions: Array<{ module: string; action: string }>
): Promise<boolean> => {
  try {
    const permissionChecks = await Promise.all(
      permissions.map(perm => checkUserPermission(userId, perm.module, perm.action))
    );

    return permissionChecks.some(hasPermission => hasPermission);
  } catch (error) {
    logger.error(`Error checking any permission for user ${userId}:`, error);
    return false;
  }
};

/**
 * Middleware to check if user has any of the required permissions
 * @param permissions - Array of {module, action} objects
 * @returns Express middleware function
 */
export const requireAnyPermission = (permissions: Array<{ module: string; action: string }>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Authentication required"
        });
        return;
      }

      const userId = req.user.id;
      const hasAnyPermission = await checkAnyPermission(userId, permissions);

      if (!hasAnyPermission) {
        logger.warn(`Access denied for user ${userId}: requires any of ${JSON.stringify(permissions)}`);
        res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          required: permissions
        });
        return;
      }

      next();

    } catch (error) {
      logger.error("Permission middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during permission check"
      });
    }
  };
};

/**
 * Get all permissions for a user
 * @param userId - The ID of the user
 * @returns Promise<Array<{module: string, action: string, name: string}>>
 */
export const getUserPermissions = async (userId: string) => {
  try {
    const prismaService = PrismaService.getInstance();
    const prisma = prismaService.getClient();

    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
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

    if (!userWithRoles) {
      return [];
    }

    const permissions = userWithRoles.userRoles.flatMap((userRole: any) =>
      userRole.role.permissions
        .filter((rolePermission: any) => rolePermission.permission.isActive)
        .map((rolePermission: any) => ({
          module: rolePermission.permission.module,
          action: rolePermission.permission.action,
          name: rolePermission.permission.name,
          description: rolePermission.permission.description
        }))
    );

    // Remove duplicates
    const uniquePermissions = permissions.filter((permission: any, index: number, self: any[]) =>
      index === self.findIndex((p: any) =>
        p.module === permission.module && p.action === permission.action
      )
    );

    return uniquePermissions;

  } catch (error) {
    logger.error(`Error getting permissions for user ${userId}:`, error);
    return [];
  }
};

/**
 * Check if user has a specific role
 * @param userId - The ID of the user
 * @param roleName - The name of the role to check
 * @returns Promise<boolean> - True if user has the role, false otherwise
 */
export const checkUserRole = async (userId: string, roleName: string): Promise<boolean> => {
  try {
    const prismaService = PrismaService.getInstance();
    const prisma = prismaService.getClient();

    const userRole = await prisma.userRole_Assignment.findFirst({
      where: {
        userId,
        isActive: true,
        role: {
          name: roleName,
          isActive: true
        }
      }
    });

    return !!userRole;
  } catch (error) {
    logger.error(`Error checking role for user ${userId}:`, error);
    return false;
  }
};

/**
 * Middleware to check if user has a specific role
 * @param roleName - The name of the role to check
 * @returns Express middleware function
 */
export const requireRole = (roleName: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Authentication required"
        });
        return;
      }

      const userId = req.user.id;
      const hasRole = await checkUserRole(userId, roleName);

      if (!hasRole) {
        logger.warn(`Access denied for user ${userId}: role ${roleName} required`);
        res.status(403).json({
          success: false,
          message: "Insufficient privileges",
          required: roleName
        });
        return;
      }

      next();

    } catch (error) {
      logger.error("Role middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during role check"
      });
    }
  };
};

/**
 * Get all roles for a user
 * @param userId - The ID of the user
 * @returns Promise<Array<{id: string, name: string, description: string}>>
 */
export const getUserRoles = async (userId: string) => {
  try {
    const prismaService = PrismaService.getInstance();
    const prisma = prismaService.getClient();

    const userRoles = await prisma.userRole_Assignment.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        role: true
      }
    });

    return userRoles
      .filter(userRole => userRole.role.isActive)
      .map(userRole => ({
        id: userRole.role.id,
        name: userRole.role.name,
        description: userRole.role.description || ''
      }));

  } catch (error) {
    logger.error(`Error getting roles for user ${userId}:`, error);
    return [];
  }
};

/**
 * Type definitions for better type safety
 */
export interface PermissionCheck {
  module: string;
  action: string;
}

export interface UserPermission {
  module: string;
  action: string;
  name: string;
  description?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
}

/*
 * USAGE EXAMPLES:
 * 
 * 1. Basic permission check in route:
 * app.get('/admin/users', requirePermission('user', 'read'), (req, res) => {
 *   // Route handler
 * });
 * 
 * 2. Multiple permissions (user must have ALL):
 * app.post('/admin/users', requirePermission('user', 'create'), (req, res) => {
 *   // Route handler
 * });
 * 
 * 3. Any permission (user must have ANY):
 * app.get('/dashboard', requireAnyPermission([
 *   { module: 'dashboard', action: 'view' },
 *   { module: 'admin', action: 'access' }
 * ]), (req, res) => {
 *   // Route handler
 * });
 * 
 * 4. Role-based access:
 * app.get('/admin', requireRole('ADMIN'), (req, res) => {
 *   // Route handler
 * });
 * 
 * 5. Programmatic permission check:
 * const hasPermission = await checkUserPermission(userId, 'fuel', 'dispense');
 * if (hasPermission) {
 *   // Allow action
 * }
 * 
 * 6. Get user permissions for UI:
 * const permissions = await getUserPermissions(userId);
 * res.json({ permissions });
 */
