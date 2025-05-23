import { PrismaClient, Prisma } from '@prisma/client';
import PrismaService from '../services/prisma.services';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

/**
 * Database class for managing database connection
 */
export class Database {
  private static instance: Database;
  private prismaService: PrismaService;
  private isInitialized: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Get the singleton instance of Database
   * @returns Database instance
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Initialize the database connection
   */
  public async initialize(): Promise<void> {
    if (!this.isInitialized) {
      try {
        await this.prismaService.connect();
        this.isInitialized = true;
        logger.info('Database initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize database:', error);
        throw error;
      }
    }
  }

  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (this.isInitialized) {
      try {
        await this.prismaService.disconnect();
        this.isInitialized = false;
        logger.info('Database disconnected successfully');
      } catch (error) {
        logger.error('Failed to disconnect from database:', error);
        throw error;
      }
    }
  }

  /**
   * Get the Prisma client instance
   * @returns PrismaClient instance
   */
  public getClient(): PrismaClient {
    return this.prismaService.getClient();
  }
  /**
   * Check database health
   * @returns Health status object
   */
  public async healthCheck(): Promise<{ status: string; details?: any }> {
    return await this.prismaService.getHealthStatus();
  }

  /**
   * Execute a transaction with the database
   * @param fn Transaction function
   * @returns Result of the transaction
   */
  public async transaction<T>(fn: (prisma: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prismaService.transaction(fn);
  }

  /**
   * Get initialization status
   * @returns Whether the database is initialized
   */
  public isInitializedStatus(): boolean {
    return this.isInitialized;
  }
}
