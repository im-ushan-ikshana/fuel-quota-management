import TransactionRepository, { 
  CreateTransactionData, 
  TransactionFilters, 
  TransactionWithDetails 
} from '../repositories/transactions.repo';
import VehicleRepository from '../repositories/vehicles.repo';
import { createLogger } from '../utils/logger';
import { FuelTransaction, TransactionStatus, FuelType } from '@prisma/client';

const logger = createLogger('TransactionService');

export interface FuelPumpingRequest {
  qrCode: string;
  vehicleId: string;
  fuelStationId: string;
  operatorId: string;
  fuelType: FuelType;
  quantity: number;
  pricePerLiter: number;
}

export interface TransactionStatsResponse {
  totalTransactions: number;
  totalFuelDispensed: number;
  totalRevenue: number;
  averageTransactionValue: number;
  topFuelTypes: Array<{
    fuelType: FuelType;
    totalQuantity: number;
    transactionCount: number;
  }>;
}

class TransactionService {
  private transactionRepository: TransactionRepository;
  private vehicleRepository: VehicleRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
    this.vehicleRepository = new VehicleRepository();
  }

  /**
   * Process a fuel pumping transaction
   */
  async processFuelPumping(pumpingRequest: FuelPumpingRequest): Promise<TransactionWithDetails> {
    try {
      this.validateTransactionRequest(pumpingRequest);
      logger.info(`Processing fuel pumping for vehicle: ${pumpingRequest.vehicleId}`);

      // Validate vehicle exists and is active
      const vehicle = await this.vehicleRepository.getVehicleById(pumpingRequest.vehicleId);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      if (!vehicle.isActive) {
        throw new Error('Vehicle is not active');
      }

      // Validate QR code matches vehicle
      if (vehicle.qrCode !== pumpingRequest.qrCode) {
        throw new Error('Invalid QR code for this vehicle');
      }

      // Check fuel type compatibility
      if (vehicle.fuelType !== pumpingRequest.fuelType) {
        throw new Error(`Vehicle requires ${vehicle.fuelType} but ${pumpingRequest.fuelType} was requested`);
      }

      // Check quota availability
      const remainingQuota = vehicle.monthlyQuotaLimit - vehicle.currentQuotaUsed;
      if (remainingQuota < pumpingRequest.quantity) {
        throw new Error(`Insufficient quota. Available: ${remainingQuota}L, Requested: ${pumpingRequest.quantity}L`);
      }

      // Calculate total amount
      const totalAmount = pumpingRequest.quantity * pumpingRequest.pricePerLiter;

      // Create transaction data
      const transactionData: CreateTransactionData = {
        vehicleId: pumpingRequest.vehicleId,
        fuelStationId: pumpingRequest.fuelStationId,
        operatorId: pumpingRequest.operatorId,
        qrCodeScanned: pumpingRequest.qrCode,
        fuelType: pumpingRequest.fuelType,
        quantity: pumpingRequest.quantity,
        pricePerLiter: pumpingRequest.pricePerLiter,
        totalAmount: totalAmount,
        quotaBefore: vehicle.currentQuotaUsed,
        quotaAfter: vehicle.currentQuotaUsed + pumpingRequest.quantity,
      };

      // Create the transaction
      const transaction = await this.transactionRepository.createTransaction(transactionData);      // Update vehicle quota
      await this.vehicleRepository.updateQuotaAfterConsumption(
        pumpingRequest.vehicleId,
        pumpingRequest.quantity
      );

      // Get transaction with details
      const transactionWithDetails = await this.transactionRepository.getTransactionById(transaction.id);
      if (!transactionWithDetails) {
        throw new Error('Failed to retrieve created transaction');
      }

      logger.info(`Fuel pumping transaction completed: ${transaction.id}`);
      return transactionWithDetails;

    } catch (error) {
      logger.error(`Error processing fuel pumping:`, error);
      throw error;
    }
  }

  /**
   * Get vehicle quota information by QR code
   */
  async getVehicleQuotaByQRCode(qrCode: string): Promise<{
    vehicle: {
      id: string;
      registrationNumber: string;
      vehicleType: string;
      fuelType: FuelType;
      ownerName: string;
    };
    quota: {
      allocatedQuota: number;
      usedQuota: number;
      remainingQuota: number;
      quotaPercentage: number;
    };
  }> {
    try {
      const vehicle = await this.vehicleRepository.getVehicleByQRCode(qrCode);
      if (!vehicle) {
        throw new Error('Vehicle not found for the provided QR code');
      }

      if (!vehicle.isActive) {
        throw new Error('Vehicle is not active');
      }

      const remainingQuota = vehicle.monthlyQuotaLimit - vehicle.currentQuotaUsed;
      const quotaPercentage = (vehicle.currentQuotaUsed / vehicle.monthlyQuotaLimit) * 100;

      return {
        vehicle: {
          id: vehicle.id,
          registrationNumber: vehicle.registrationNumber,
          vehicleType: vehicle.vehicleType,
          fuelType: vehicle.fuelType,
          ownerName: `${vehicle.owner.user.firstName} ${vehicle.owner.user.lastName}`,
        },
        quota: {
          allocatedQuota: vehicle.monthlyQuotaLimit,
          usedQuota: vehicle.currentQuotaUsed,
          remainingQuota: remainingQuota,
          quotaPercentage: Math.round(quotaPercentage * 100) / 100,
        },
      };
    } catch (error) {
      logger.error(`Error getting vehicle quota by QR code:`, error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<TransactionWithDetails | null> {
    try {
      return await this.transactionRepository.getTransactionById(transactionId);
    } catch (error) {
      logger.error(`Error getting transaction by ID:`, error);
      throw error;
    }
  }

  /**
   * Get transactions with filtering and pagination
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
      return await this.transactionRepository.getTransactions(filters, page, limit);
    } catch (error) {
      logger.error(`Error getting transactions:`, error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(filters: TransactionFilters = {}): Promise<TransactionStatsResponse> {
    try {
      const basicStats = await this.transactionRepository.getTransactionStats(filters);

      // TODO: Implement top fuel types calculation
      // This would require additional queries to get fuel type breakdown
      const topFuelTypes = [
        {
          fuelType: FuelType.PETROL_92_OCTANE,
          totalQuantity: 0,
          transactionCount: 0,
        },
      ];

      return {
        ...basicStats,
        topFuelTypes,
      };
    } catch (error) {
      logger.error(`Error getting transaction statistics:`, error);
      throw error;
    }
  }

  /**
   * Get transactions by vehicle ID
   */
  async getTransactionsByVehicle(vehicleId: string, limit: number = 50): Promise<FuelTransaction[]> {
    try {
      return await this.transactionRepository.getTransactionsByVehicle(vehicleId, limit);
    } catch (error) {
      logger.error(`Error getting transactions by vehicle:`, error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(transactionId: string, status: TransactionStatus): Promise<FuelTransaction> {
    try {
      return await this.transactionRepository.updateTransactionStatus(transactionId, status);
    } catch (error) {
      logger.error(`Error updating transaction status:`, error);
      throw error;
    }
  }

  /**
   * Cancel transaction (soft delete)
   */
  async cancelTransaction(transactionId: string): Promise<FuelTransaction> {
    try {
      // TODO: Implement quota rollback logic if needed
      return await this.transactionRepository.deleteTransaction(transactionId);
    } catch (error) {
      logger.error(`Error cancelling transaction:`, error);
      throw error;
    }
  }

  /**
   * Validate transaction request
   */
  private validateTransactionRequest(request: FuelPumpingRequest): void {
    if (!request.qrCode) {
      throw new Error('QR code is required');
    }

    if (!request.vehicleId) {
      throw new Error('Vehicle ID is required');
    }

    if (!request.fuelStationId) {
      throw new Error('Fuel station ID is required');
    }

    if (!request.operatorId) {
      throw new Error('Operator ID is required');
    }

    if (!request.fuelType) {
      throw new Error('Fuel type is required');
    }

    if (!request.quantity || request.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (!request.pricePerLiter || request.pricePerLiter <= 0) {
      throw new Error('Price per liter must be greater than 0');
    }
  }
}

export default TransactionService;