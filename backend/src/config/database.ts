import PrismaService from '../services/prisma.services';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

export class Database {
  private static instance: Database;
  private prismaService: PrismaService;
  private isInitialized: boolean = false;

  private constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Get singleton instance of Database
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Initialize database connection
   */
  public async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        logger.info('Database already initialized');
        return;
      }

      logger.info('Initializing database connection...');
      
      // Connect to database using Prisma
      await this.prismaService.connect();
      
      this.isInitialized = true;
      logger.info('Database initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Health check for database
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    timestamp: string;
    details?: any;
  }> {
    try {
      // Test database connection with a simple query
      await this.prismaService.getClient().$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        message: 'Database connection is healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      if (!this.isInitialized) {
        logger.info('Database not initialized, nothing to disconnect');
        return;
      }

      logger.info('Disconnecting from database...');
      await this.prismaService.disconnect();
      
      this.isInitialized = false;
      logger.info('Database disconnected successfully');
      
    } catch (error) {
      logger.error('Error during database disconnection:', error);
      throw error;
    }
  }

  /**
   * Get Prisma client instance
   */
  public getClient() {
    return this.prismaService.getClient();
  }

  /**
   * Check if database is initialized
   */
  public isConnected(): boolean {
    return this.isInitialized;
  }
}

export default Database;
