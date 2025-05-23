import { createLogger } from './logger';

const logger = createLogger('PrismaMiddleware');

/**
 * Enhanced error handling for Prisma operations
 * @param error Any error that might have occurred
 * @param operation Description of the operation
 * @returns Standardized error object
 */
export function handlePrismaError(error: any, operation: string): Error {
  // Known Prisma error codes
  const UNIQUE_CONSTRAINT_FAILED = 'P2002';
  const FOREIGN_KEY_CONSTRAINT_FAILED = 'P2003';
  const RECORD_NOT_FOUND = 'P2001';
  const REQUIRED_FIELD_MISSING = 'P2012';

  // Check if it's a Prisma error with code
  if (error?.code) {
    switch (error.code) {
      case UNIQUE_CONSTRAINT_FAILED:
        const fields = error.meta?.target || 'unknown field';
        return new Error(`Duplicate entry for ${fields}. The value already exists.`);
      
      case FOREIGN_KEY_CONSTRAINT_FAILED:
        const field = error.meta?.field_name || 'unknown field';
        return new Error(`Related record not found for ${field}.`);
      
      case RECORD_NOT_FOUND:
        return new Error(`Record not found during ${operation}.`);
      
      case REQUIRED_FIELD_MISSING:
        const missingField = error.meta?.path || 'unknown field';
        return new Error(`Required field missing: ${missingField}.`);
      
      default:
        logger.error(`Prisma error during ${operation}:`, error);
        return new Error(`Database error during ${operation}. Please try again later.`);
    }
  }

  // Handle connection errors
  if (error?.message?.includes('connect')) {
    logger.error(`Database connection error during ${operation}:`, error);
    return new Error('Unable to connect to the database. Please try again later.');
  }

  // For any other errors, log and return a generic message
  logger.error(`Unexpected error during ${operation}:`, error);
  return new Error(`An error occurred during ${operation}. Please try again later.`);
}
