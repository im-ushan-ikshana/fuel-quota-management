import { PrismaClient, Prisma } from '@prisma/client';
import { createLogger } from '../utils/logger';
import { handlePrismaError } from '../utils/prisma-middleware';

// Create a logger for Prisma operations
const logger = createLogger('PrismaService');

// Prisma Client options
const prismaOptions: Prisma.PrismaClientOptions = {
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ] as any,
};

// Create the Prisma client class with connection management
class PrismaService {
  private static instance: PrismaService;
  private prisma: PrismaClient;
  private isConnected: boolean = false;  
  
  private constructor() {
    this.prisma = new PrismaClient(prismaOptions);
    this.setupLogging();
    this.applyMiddleware();
  }
    /**
   * Apply middleware to Prisma Client instance
   */
  private applyMiddleware(): void {
    // Add middleware for all Prisma operations
    this.prisma.$use(async (params: any, next: any) => {
      const startTime = Date.now();
      const modelName = params.model;
      const action = params.action;
      const args = params.args;

      // Log operation details in debug mode
      if (process.env.DEBUG === 'true') {
        logger.debug(`Starting ${modelName}.${action}`, { args: JSON.stringify(args) });
      }

      try {
        // Execute the operation
        const result = await next(params);
        
        const duration = Date.now() - startTime;
        
        // Log operation completion details
        if (process.env.DEBUG === 'true') {
          logger.debug(`Completed ${modelName}.${action} in ${duration}ms`);
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Failed ${modelName}.${action} after ${duration}ms`, error);
        
        // Rethrow the error for handling in the service layer
        throw error;
      }
    });
  }

  /**
   * Get the singleton instance of PrismaService
   * @returns PrismaService instance
   */
  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  /**
   * Get the Prisma client instance
   * @returns PrismaClient instance
   */
  public getClient(): PrismaClient {
    return this.prisma;
  }
  /**
   * Setup logging for Prisma client events
   */
  private setupLogging(): void {
    if (process.env.DEBUG === 'true') {
      // Use type assertion for event handling with proper types
      (this.prisma as any).$on('query', (e: any) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Params: ${e.params}`);
        logger.debug(`Duration: ${e.duration}ms`);
      });

      (this.prisma as any).$on('info', (e: any) => {
        logger.info(`Prisma info: ${e.message}`);
      });

      (this.prisma as any).$on('warn', (e: any) => {
        logger.warn(`Prisma warning: ${e.message}`);
      });

      (this.prisma as any).$on('error', (e: any) => {
        logger.error(`Prisma error: ${e.message}`);
        logger.error(e.stack || 'No stack trace available');
      });
    }
  }
  /**
   * Connect to the database
   */
  public async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.prisma.$connect();
        this.isConnected = true;
        logger.info('Successfully connected to the database');
      } catch (error) {        logger.error('Failed to connect to the database:', error);
        throw handlePrismaError(error, 'database connection');
      }
    }
  }

  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.prisma.$disconnect();
        this.isConnected = false;
        logger.info('Successfully disconnected from the database');
      } catch (error) {        logger.error('Failed to disconnect from the database:', error);
        throw handlePrismaError(error, 'database disconnection');
      }
    }
  }  /**
   * Executes a transaction with automatic error handling and connection management
   * @param fn The transaction function
   * @returns Result of the transaction
   */
  public async transaction<T>(fn: (prisma: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    try {
      // Make sure we're connected
      await this.connect();
      
      // Start a transaction with the proper typing
      const result = await this.prisma.$transaction(async (tx) => {
        return await fn(tx as any);
      }, {
        maxWait: 5000, // maximum amount of time to wait to acquire transaction
        timeout: 10000  // maximum amount of time transaction can run
      });

      return result;
    } catch (error) {      logger.error('Transaction failed:', error);
      throw handlePrismaError(error, 'transaction execution');
    }
  }
  /**
   * Get health status of the database connection
   */
  public async getHealthStatus(): Promise<{ status: string; details?: any }> {
    try {
      // Execute a simple query to check connection
      await this.prisma.$queryRaw`SELECT 1 as result`;
      return { 
        status: 'healthy', 
        details: { 
          connected: this.isConnected,
        } 
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        details: {
          error: (error instanceof Error) ? error.message : String(error),
          connected: this.isConnected
        } 
      };
    }  }
}

export default PrismaService;
