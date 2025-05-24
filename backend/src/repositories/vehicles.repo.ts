import PrismaService from '../services/prisma.services';
import { handlePrismaError } from '../utils/prisma.middleware';
import { createLogger } from '../utils/logger';
import { VehicleType, FuelType, Vehicle, DMTValidation, FuelTransaction } from '@prisma/client';

const logger = createLogger('VehicleRepository');

export interface CreateVehicleData {
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  make: string;
  model: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
  monthlyQuotaLimit: number;
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
    try {
      return await this.prismaService.transaction(async (prisma) => {
        // Generate QR code (simple UUID for now, can be enhanced)
        const qrCode = `VH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create vehicle
        const vehicle = await prisma.vehicle.create({
          data: {
            ...vehicleData,
            qrCode,
            qrCodeGeneratedAt: new Date(),
            currentQuotaUsed: 0,
            quotaResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // First day of next month
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
  }

  /**
   * Validate vehicle against DMT database (mock implementation)
   */
  async validateWithDMT(registrationNumber: string): Promise<DMTValidationData | null> {
    try {
      // Mock DMT validation - in real implementation, this would call external API
      const mockDMTData: Record<string, DMTValidationData> = {
        'ABC-1234': {
          registrationNumber: 'ABC-1234',
          chassisNumber: 'CH123456789',
          engineNumber: 'EN987654321',
          ownerNic: '123456789V',
          ownerName: 'John Doe',
        },
        'XYZ-5678': {
          registrationNumber: 'XYZ-5678',
          chassisNumber: 'CH987654321',
          engineNumber: 'EN123456789',
          ownerNic: '987654321V',
          ownerName: 'Jane Smith',
        },
        'DEF-9012': {
          registrationNumber: 'DEF-9012',
          chassisNumber: 'CH555666777',
          engineNumber: 'EN777888999',
          ownerNic: '555666777V',
          ownerName: 'Mike Johnson',
        },
      };

      const validationData = mockDMTData[registrationNumber.toUpperCase()];
      
      if (validationData) {
        logger.info(`DMT validation successful for vehicle: ${registrationNumber}`);
        return validationData;
      } else {
        logger.warn(`DMT validation failed for vehicle: ${registrationNumber}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error validating vehicle with DMT:`, error);
      throw handlePrismaError(error, 'validating vehicle with DMT');
    }
  }

  /**
   * Store DMT validation result
   */
  async storeDMTValidation(vehicleId: string, validationData: DMTValidationData): Promise<DMTValidation> {
    try {
      const dmtValidation = await this.prismaService.getClient().dMTValidation.create({
        data: {
          vehicleId,
          ...validationData,
        },
      });

      logger.info(`DMT validation stored for vehicle: ${vehicleId}`);
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

        // Check if quota reset is needed (monthly reset)
        const now = new Date();
        const quotaResetDate = vehicle.quotaResetDate;
        
        let currentQuotaUsed = vehicle.currentQuotaUsed;
        
        if (quotaResetDate && now >= quotaResetDate) {
          // Reset quota to 0 and set next reset date
          currentQuotaUsed = 0;
          const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          
          await prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
              currentQuotaUsed: 0,
              quotaResetDate: nextResetDate,
            },
          });
        }

        // Check if sufficient quota is available
        const newQuotaUsed = currentQuotaUsed + fuelUsed;
        if (newQuotaUsed > vehicle.monthlyQuotaLimit) {
          throw new Error('Insufficient quota remaining');
        }

        // Update quota
        const updatedVehicle = await prisma.vehicle.update({
          where: { id: vehicleId },
          data: {
            currentQuotaUsed: newQuotaUsed,
          },
        });

        logger.info(`Updated quota for vehicle ${vehicleId}: ${newQuotaUsed}/${vehicle.monthlyQuotaLimit}`);
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
          monthlyQuotaLimit: true,
          currentQuotaUsed: true,
          quotaResetDate: true,
        },
      });

      if (!vehicle) {
        return null;
      }

      return {
        allocatedQuota: vehicle.monthlyQuotaLimit,
        usedQuota: vehicle.currentQuotaUsed,
        remainingQuota: vehicle.monthlyQuotaLimit - vehicle.currentQuotaUsed,
        resetDate: vehicle.quotaResetDate,
      };
    } catch (error) {
      logger.error(`Error getting vehicle quota:`, error);
      throw handlePrismaError(error, 'getting vehicle quota');
    }
  }
}

export default VehicleRepository;