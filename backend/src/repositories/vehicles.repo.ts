import PrismaService from '../services/prisma.services';
import { handlePrismaError } from '../utils/prisma.middleware';
import { createLogger } from '../utils/logger';
import { VehicleType, FuelType, Vehicle, DMTValidation, FuelTransaction } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('VehicleRepository');

export interface CreateVehicleData {
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  make: string;
  model: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
  weeklyQuotaLiters: number;
  ownerId: string;
}

export interface VehicleWithOwner extends Vehicle {
  owner: {
    id: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      nicNumber: string;
    };
  };
}

export interface VehicleWithTransactions extends Vehicle {
  fuelTransactions: FuelTransaction[];
}

export interface DMTValidationData {
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  ownerNic: string;
  ownerName: string;
}

class VehicleRepository {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Register a new vehicle with owner details
   */
  async registerVehicle(vehicleData: CreateVehicleData): Promise<Vehicle> {
    try {      return await this.prismaService.transaction(async (prisma) => {
        // Generate QR code using UUID v4
        const qrCode = `qr_${uuidv4()}`;
          // Create vehicle
        const vehicle = await prisma.vehicle.create({
          data: {
            ...vehicleData,
            qrCode,
            qrCodeGeneratedAt: new Date(),
            currentWeekUsed: 0,
            weekStartDate: new Date(), // Current week start
          },
          include: {
            owner: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                    nicNumber: true,
                  },
                },
              },
            },
          },
        });

        logger.info(`Vehicle registered successfully: ${vehicle.registrationNumber}`);
        return vehicle;
      });
    } catch (error) {
      logger.error(`Error registering vehicle:`, error);
      throw handlePrismaError(error, 'registering vehicle');
    }
  }  /**
   * Validate vehicle against DMT database (query from dmt_validations table)
   */
  async validateWithDMT(registrationNumber: string): Promise<DMTValidationData | null> {
    try {
      logger.info(`Querying DMT validation for vehicle: ${registrationNumber}`);
      
      // Query the actual dmt_validations table in the database
      const dmtValidation = await this.prismaService.getClient().dMTValidation.findFirst({
        where: {
          registrationNumber: registrationNumber.toUpperCase()
        }
      });

      if (dmtValidation) {
        logger.info(`DMT validation found for vehicle: ${registrationNumber}`);
        return {
          registrationNumber: dmtValidation.registrationNumber,
          chassisNumber: dmtValidation.chassisNumber,
          engineNumber: dmtValidation.engineNumber,
          ownerNic: dmtValidation.ownerNic,
          ownerName: dmtValidation.ownerName,
        };
      } else {
        logger.warn(`No DMT validation found for vehicle: ${registrationNumber}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error validating vehicle with DMT:`, error);
      throw handlePrismaError(error, 'validating vehicle with DMT');
    }
  }

  /**
   * Store DMT validation result
   */  async storeDMTValidation(vehicleId: string, validationData: DMTValidationData): Promise<DMTValidation> {
    try {
      // Create DMT validation
      const dmtValidation = await this.prismaService.getClient().dMTValidation.create({
        data: validationData as any,
      });

      // Link the DMT validation to the vehicle
      await this.prismaService.getClient().vehicle.update({
        where: { id: vehicleId },
        data: { dmtValidationId: dmtValidation.id } as any,
      });

      logger.info(`DMT validation stored and linked for vehicle: ${vehicleId}`);
      return dmtValidation;
    } catch (error) {
      logger.error(`Error storing DMT validation:`, error);
      throw handlePrismaError(error, 'storing DMT validation');
    }
  }

  /**
   * Get vehicle by ID with owner details
   */
  async getVehicleById(vehicleId: string): Promise<VehicleWithOwner | null> {
    try {
      const vehicle = await this.prismaService.getClient().vehicle.findUnique({
        where: { id: vehicleId, isActive: true },
        include: {
          owner: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                  nicNumber: true,
                },
              },
            },
          },
        },
      });

      if (vehicle) {
        logger.info(`Vehicle found: ${vehicle.registrationNumber}`);
      } else {
        logger.warn(`Vehicle not found: ${vehicleId}`);
      }

      return vehicle as VehicleWithOwner | null;
    } catch (error) {
      logger.error(`Error getting vehicle by ID:`, error);
      throw handlePrismaError(error, 'getting vehicle');
    }
  }

  /**
   * Get vehicle by registration number
   */
  async getVehicleByRegistration(registrationNumber: string): Promise<VehicleWithOwner | null> {
    try {
      const vehicle = await this.prismaService.getClient().vehicle.findUnique({
        where: { registrationNumber: registrationNumber.toUpperCase(), isActive: true },
        include: {
          owner: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                  nicNumber: true,
                },
              },
            },
          },
        },
      });

      return vehicle as VehicleWithOwner | null;
    } catch (error) {
      logger.error(`Error getting vehicle by registration:`, error);
      throw handlePrismaError(error, 'getting vehicle by registration');
    }
  }

  /**
   * Get vehicle by QR code
   */
  async getVehicleByQRCode(qrCode: string): Promise<VehicleWithOwner | null> {
    try {
      const vehicle = await this.prismaService.getClient().vehicle.findUnique({
        where: { qrCode, isActive: true },
        include: {
          owner: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                  nicNumber: true,
                },
              },
            },
          },
        },
      });

      return vehicle as VehicleWithOwner | null;
    } catch (error) {
      logger.error(`Error getting vehicle by QR code:`, error);
      throw handlePrismaError(error, 'getting vehicle by QR code');
    }
  }

  /**
   * Get vehicle transactions
   */
  async getVehicleTransactions(vehicleId: string, limit: number = 50): Promise<FuelTransaction[]> {
    try {
      const transactions = await this.prismaService.getClient().fuelTransaction.findMany({
        where: { vehicleId },
        orderBy: { transactionDate: 'desc' },
        take: limit,
        include: {
          fuelStation: {
            select: {
              id: true,
              name: true,
              stationCode: true,
            },
          },
          operator: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      logger.info(`Found ${transactions.length} transactions for vehicle: ${vehicleId}`);
      return transactions;
    } catch (error) {
      logger.error(`Error getting vehicle transactions:`, error);
      throw handlePrismaError(error, 'getting vehicle transactions');
    }
  }
  /**
   * Update vehicle quota after fuel consumption
   */
  async updateQuotaAfterConsumption(vehicleId: string, fuelUsed: number): Promise<Vehicle> {
    try {
      return await this.prismaService.transaction(async (prisma) => {
        // Get current vehicle data
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId },
        });

        if (!vehicle) {
          throw new Error('Vehicle not found');
        }

        // Check if quota reset is needed (weekly reset)
        const now = new Date();
        const weekStartDate = vehicle.weekStartDate;
        
        let currentWeekUsed = vehicle.currentWeekUsed;
        
        if (weekStartDate) {
          // Calculate if a week has passed (7 days)
          const daysSinceStart = Math.floor((now.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceStart >= 7) {
            // Reset quota to 0 and set new week start date
            currentWeekUsed = 0;
            
            await prisma.vehicle.update({
              where: { id: vehicleId },
              data: {
                currentWeekUsed: 0,
                weekStartDate: now,
              },
            });
          }
        }

        // Check if sufficient quota is available
        const newQuotaUsed = currentWeekUsed + fuelUsed;
        if (newQuotaUsed > vehicle.weeklyQuotaLiters) {
          throw new Error('Insufficient quota remaining');
        }

        // Update quota
        const updatedVehicle = await prisma.vehicle.update({
          where: { id: vehicleId },
          data: {
            currentWeekUsed: newQuotaUsed,
          },
        });

        logger.info(`Updated quota for vehicle ${vehicleId}: ${newQuotaUsed}/${vehicle.weeklyQuotaLiters} liters`);
        return updatedVehicle;
      });
    } catch (error) {
      logger.error(`Error updating quota:`, error);
      throw handlePrismaError(error, 'updating vehicle quota');
    }
  }
  /**
   * Get vehicle quota information
   */
  async getVehicleQuota(vehicleId: string): Promise<{
    allocatedQuota: number;
    usedQuota: number;
    remainingQuota: number;
    resetDate: Date | null;
  } | null> {
    try {
      const vehicle = await this.prismaService.getClient().vehicle.findUnique({
        where: { id: vehicleId, isActive: true },
        select: {
          weeklyQuotaLiters: true,
          currentWeekUsed: true,
          weekStartDate: true,
        },
      });

      if (!vehicle) {
        return null;
      }

      return {
        allocatedQuota: vehicle.weeklyQuotaLiters,
        usedQuota: vehicle.currentWeekUsed,
        remainingQuota: vehicle.weeklyQuotaLiters - vehicle.currentWeekUsed,
        resetDate: vehicle.weekStartDate,
      };
    } catch (error) {
      logger.error(`Error getting vehicle quota:`, error);
      throw handlePrismaError(error, 'getting vehicle quota');
    }
  }

  /**
   * Get all DMT validations for testing
   */
  async getAllDMTValidations(): Promise<any[]> {
    try {
      logger.info('Fetching all DMT validations from database');
      
      const dmtValidations = await this.prismaService.getClient().dMTValidation.findMany({
        orderBy: { registrationNumber: 'asc' }
      });
      
      logger.info(`Found ${dmtValidations.length} DMT validations`);
      return dmtValidations;
    } catch (error) {
      logger.error('Error fetching DMT validations:', error);
      throw error;
    }
  }

  /**
   * Get count of DMT validations
   */
  async getDMTValidationsCount(): Promise<number> {
    try {
      logger.info('Counting DMT validations in database');
      
      const count = await this.prismaService.getClient().dMTValidation.count();
      
      logger.info(`Total DMT validations count: ${count}`);
      return count;
    } catch (error) {
      logger.error('Error counting DMT validations:', error);
      throw error;
    }
  }
}

export default VehicleRepository;