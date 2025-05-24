import PrismaService from '../services/prisma.services';
import { handlePrismaError } from '../utils/prisma.middleware';
import { createLogger } from '../utils/logger';
import { FuelTransaction, TransactionStatus, FuelType } from '@prisma/client';

const logger = createLogger('TransactionRepository');

export interface CreateTransactionData {
  vehicleId: string;
  fuelStationId: string;
  operatorId: string;
  qrCodeScanned: string;
  fuelType: FuelType;
  quantityLiters: number;
  quotaBefore: number;
  quotaAfter: number;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  vehicleId?: string;
  fuelStationId?: string;
  operatorId?: string;
}

export interface TransactionWithDetails extends FuelTransaction {
  vehicle: {
    id: string;
    registrationNumber: string;
    vehicleType: string;
    owner: {
      user: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
      };
    };
  };
  fuelStation: {
    id: string;
    name: string;
    address: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      district: string;
      province: string;
    };
  };
}

class TransactionRepository {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }
  /**
   * Create a new fuel transaction
   */
  async createTransaction(transactionData: CreateTransactionData): Promise<FuelTransaction> {
    try {
      return await this.prismaService.transaction(async (prisma) => {
        // Create the transaction
        const transaction = await prisma.fuelTransaction.create({
          data: {
            ...transactionData,
            transactionDate: new Date(),
          },
        });

        logger.info(`Transaction created successfully: ${transaction.id}`);
        return transaction;
      });
    } catch (error) {
      logger.error(`Error creating transaction:`, error);
      throw handlePrismaError(error, 'creating transaction');
    }
  }

  /**
   * Get transaction by ID with details
   */
  async getTransactionById(transactionId: string): Promise<TransactionWithDetails | null> {
    try {
      const transaction = await this.prismaService.getClient().fuelTransaction.findUnique({
        where: { id: transactionId },
        include: {
          vehicle: {
            select: {
              id: true,
              registrationNumber: true,
              vehicleType: true,
              owner: {
                select: {                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phoneNumber: true,
                    },
                  },
                },
              },
            },
          },
          fuelStation: {
            select: {
              id: true,
              name: true,
              address: {
                select: {
                  addressLine1: true,
                  addressLine2: true,
                  city: true,
                  district: true,
                  province: true,
                },
              },
            },
          },
        },
      });

      return transaction as TransactionWithDetails | null;
    } catch (error) {
      logger.error(`Error getting transaction by ID:`, error);
      throw handlePrismaError(error, 'getting transaction by ID');
    }
  }

  /**
   * Get all transactions with filtering and pagination
   */
  async getTransactions(
    filters: TransactionFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{
    transactions: TransactionWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause based on filters
      const where: any = {};

      if (filters.startDate || filters.endDate) {
        where.transactionDate = {};
        if (filters.startDate) where.transactionDate.gte = filters.startDate;
        if (filters.endDate) where.transactionDate.lte = filters.endDate;
      }      if (filters.vehicleId) where.vehicleId = filters.vehicleId;
      if (filters.fuelStationId) where.fuelStationId = filters.fuelStationId;
      if (filters.operatorId) where.operatorId = filters.operatorId;

      // Get total count
      const total = await this.prismaService.getClient().fuelTransaction.count({ where });

      // Get transactions with details
      const transactions = await this.prismaService.getClient().fuelTransaction.findMany({
        where,
        include: {
          vehicle: {
            select: {
              id: true,
              registrationNumber: true,
              vehicleType: true,
              owner: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phoneNumber: true,
                    },
                  },
                },
              },
            },
          },          fuelStation: {
            select: {
              id: true,
              name: true,
              address: {
                select: {
                  addressLine1: true,
                  addressLine2: true,
                  city: true,
                  district: true,
                  province: true,
                },
              },
            },
          },
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        transactions: transactions as TransactionWithDetails[],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error(`Error getting transactions:`, error);
      throw handlePrismaError(error, 'getting transactions');
    }
  }

  /**
   * Get transactions by vehicle ID
   */
  async getTransactionsByVehicle(vehicleId: string, limit: number = 50): Promise<FuelTransaction[]> {
    try {
      const transactions = await this.prismaService.getClient().fuelTransaction.findMany({
        where: { vehicleId },
        orderBy: { transactionDate: 'desc' },
        take: limit,
      });

      return transactions;
    } catch (error) {
      logger.error(`Error getting transactions by vehicle:`, error);
      throw handlePrismaError(error, 'getting transactions by vehicle');
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(filters: TransactionFilters = {}): Promise<{
    totalTransactions: number;
    totalFuelDispensed: number;
    totalRevenue: number;
    averageTransactionValue: number;
  }> {
    try {
      const where: any = {};

      if (filters.startDate || filters.endDate) {
        where.transactionDate = {};
        if (filters.startDate) where.transactionDate.gte = filters.startDate;
        if (filters.endDate) where.transactionDate.lte = filters.endDate;
      }

      if (filters.vehicleId) where.vehicleId = filters.vehicleId;
      if (filters.fuelStationId) where.fuelStationId = filters.fuelStationId;      const stats = await this.prismaService.getClient().fuelTransaction.aggregate({
        where,
        _count: { id: true },
        _sum: {
          quantityLiters: true,
        },
        _avg: {
          quantityLiters: true,
        },
      });

      return {
        totalTransactions: stats._count?.id || 0,
        totalFuelDispensed: stats._sum?.quantityLiters || 0,
        totalRevenue: 0, // Revenue data no longer available
        averageTransactionValue: 0, // Transaction value no longer available
      };
    } catch (error) {
      logger.error(`Error getting transaction stats:`, error);
      throw handlePrismaError(error, 'getting transaction stats');
    }
  }
  /**
   * Delete transaction (hard delete)
   */
  async deleteTransaction(transactionId: string): Promise<FuelTransaction> {
    try {
      const transaction = await this.prismaService.getClient().fuelTransaction.delete({
        where: { id: transactionId },
      });

      logger.info(`Transaction deleted: ${transactionId}`);
      return transaction;
    } catch (error) {
      logger.error(`Error deleting transaction:`, error);
      throw handlePrismaError(error, 'deleting transaction');
    }
  }
}

export default TransactionRepository;