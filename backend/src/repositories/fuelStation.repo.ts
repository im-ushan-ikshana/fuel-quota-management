import PrismaService from '../services/prisma.services';
import { createLogger } from '../utils/logger';
import { handlePrismaError } from '../utils/prisma.middleware';
import { FuelType, District, Province, FuelStation } from '@prisma/client';

const logger = createLogger('FuelStationRepository');

export interface CreateFuelStationData {
  stationCode: string;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: District;
    province: Province;
    postalCode?: string;
  };
  owner: {
    businessName: string;
    businessRegNo: string;
    userId: string;
  };
  fuelTypes: FuelType[];
  operatingHours?: {
    open: string;
    close: string;
  };
}

export interface FuelStationWithDetails {
  id: string;
  stationCode: string;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  isActive: boolean;
  address: {
    id: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    province: string;
  };
  owner: {
    id: string;
    businessName: string;
    businessRegNo: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
  };
  fuelInventory: {
    id: string;
    fuelType: FuelType;
    currentStockLiters: number;
    minimumLevelLiters: number;
    maximumLevelLiters: number;
    lastRefillDate?: Date;
    lastRefillLiters?: number;
    lastUpdated: Date;
  }[];
  operators: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
  }[];
}

export interface FuelStationInventory {
  id: string;
  fuelType: FuelType;
  currentStockLiters: number;
  minimumLevelLiters: number;
  maximumLevelLiters: number;
  lastRefillDate?: Date;
  lastRefillLiters?: number;
  lastUpdated: Date;
}

export interface FuelPriceInfo {
  fuelType: FuelType;
  pricePerLiter: number;
  lastUpdated: Date;
  isActive: boolean;
}

export interface FuelStationFilters {
  name?: string;
  district?: string;
  province?: string;
  stationCode?: string;
  isActive?: boolean;
  fuelType?: FuelType;
}

export interface FuelStationSearchFilters {
  fuelType?: FuelType;
  district?: string;
  province?: string;
  isActive?: boolean;
}

export interface FuelStationListResponse {
  fuelStations: FuelStationWithDetails[];
  total: number;
  page: number;
  limit: number;
}

class FuelStationRepository {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }
  /**
   * Register a new fuel station with owner
   */
  async registerFuelStation(data: CreateFuelStationData): Promise<any> {
    return this.prismaService.transaction(async (prisma) => {
      try {
        logger.info(`Registering fuel station: ${data.stationCode}`);

        // First, check if the user exists and is of correct type
        const user = await prisma.user.findUnique({
          where: { id: data.owner.userId },
          include: { fuelStationOwner: true }
        });

        if (!user) {
          throw new Error('User not found');
        }

        if (user.userType !== 'FUEL_STATION_OWNER') {
          throw new Error('User must be a fuel station owner');
        }

        let fuelStationOwner = user.fuelStationOwner;

        // Create fuel station owner if doesn't exist
        if (!fuelStationOwner) {
          fuelStationOwner = await prisma.fuelStationOwner.create({
            data: {
              businessName: data.owner.businessName,
              businessRegNo: data.owner.businessRegNo,
              userId: data.owner.userId,
            },
          });
          logger.info(`Created fuel station owner: ${fuelStationOwner.id}`);
        }

        // Create address
        const address = await prisma.address.create({
          data: {
            addressLine1: data.address.addressLine1,
            addressLine2: data.address.addressLine2,
            city: data.address.city,
            district: data.address.district,
            province: data.address.province,
          },
        });
        logger.info(`Created address: ${address.id}`);

        // Create fuel station
        const fuelStation = await prisma.fuelStation.create({
          data: {
            stationCode: data.stationCode,
            name: data.name,
            phoneNumber: data.phoneNumber,
            licenseNumber: data.licenseNumber,
            ownerId: fuelStationOwner.id,
            addressId: address.id,
          },
          include: {
            address: true,
            owner: {
              include: {
                user: true,
              },
            },
            fuelInventory: true,
            operators: {
              include: {
                user: true,
              },
            },
          },
        });

        // Create fuel inventory for each fuel type
        if (data.fuelTypes && data.fuelTypes.length > 0) {
          for (const fuelType of data.fuelTypes) {
            await prisma.fuelInventory.create({
              data: {
                fuelType,
                currentStockLiters: 0,
                minimumLevelLiters: 1000, // Default minimum
                maximumLevelLiters: 10000, // Default maximum
                fuelStationId: fuelStation.id,
              },
            });
          }
        }

        logger.info(`Successfully registered fuel station: ${fuelStation.stationCode}`);
        
        return fuelStation;
      } catch (error) {
        logger.error('Error in registerFuelStation:', error);
        throw error;
      }
    });
  }

  /**
   * Get fuel station by ID with full details
   */
  async getFuelStationById(stationId: string): Promise<FuelStationWithDetails | null> {
    try {
      const fuelStation = await this.prismaService.getClient().fuelStation.findUnique({
        where: { id: stationId },
        include: {
          address: true,
          owner: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                },
              },
            },
          },
          fuelInventory: true,
          operators: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      });

      return fuelStation as FuelStationWithDetails | null;
    } catch (error) {
      logger.error(`Error fetching fuel station by ID:`, error);
      throw handlePrismaError(error, 'fetching fuel station by ID');
    }
  }
  /**
   * Get fuel station by station code
   */
  async getFuelStationByCode(stationCode: string): Promise<FuelStationWithDetails | null> {
    try {
      const fuelStation = await this.prismaService.getClient().fuelStation.findUnique({
        where: { stationCode },
        include: {
          address: true,
          owner: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                },
              },
            },
          },
          fuelInventory: true,
          operators: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      });

      return fuelStation as FuelStationWithDetails | null;
    } catch (error) {
      logger.error(`Error fetching fuel station by code:`, error);
      throw handlePrismaError(error, 'fetching fuel station by code');
    }
  }

  /**
   * Get all fuel stations with optional filtering
   */
  async getAllFuelStations(
    filters: FuelStationFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{
    stations: FuelStationWithDetails[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      // Apply filters
      if (filters.name) {
        where.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.stationCode) {
        where.stationCode = {
          contains: filters.stationCode,
          mode: 'insensitive',
        };
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.district || filters.province) {
        where.address = {};
        if (filters.district) {
          where.address.district = filters.district;
        }
        if (filters.province) {
          where.address.province = filters.province;
        }
      }

      const [stations, total] = await Promise.all([
        this.prismaService.getClient().fuelStation.findMany({
          where,
          skip,
          take: limit,
          include: {
            address: true,
            owner: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                  },
                },
              },
            },            fuelInventory: true,
            operators: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { isActive: 'desc' },
            { name: 'asc' },
          ],
        }),
        this.prismaService.getClient().fuelStation.count({ where }),
      ]);

      return {
        stations: stations as FuelStationWithDetails[],
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      logger.error(`Error fetching fuel stations:`, error);
      throw handlePrismaError(error, 'fetching fuel stations');
    }
  }

  /**
   * Get fuel station inventory by station ID
   */
  async getFuelStationInventory(stationId: string): Promise<FuelStationInventory[]> {
    try {
      const inventory = await this.prismaService.getClient().fuelInventory.findMany({
        where: { fuelStationId: stationId },
        orderBy: { fuelType: 'asc' },
      });

      return inventory as FuelStationInventory[];
    } catch (error) {
      logger.error(`Error fetching fuel station inventory:`, error);
      throw handlePrismaError(error, 'fetching fuel station inventory');
    }
  }

  /**
   * Get current fuel prices at a station (mock implementation - prices would be in a separate table in production)
   */
  async getFuelStationPrices(stationId: string): Promise<FuelPriceInfo[]> {
    try {
      // For now, return mock prices based on fuel types available in inventory
      const inventory = await this.getFuelStationInventory(stationId);
      
      // Mock pricing - in production this would come from a fuel_prices table
      const mockPrices: Record<FuelType, number> = {
        PETROL_92_OCTANE: 365.00,
        PETROL_95_OCTANE: 385.00,
        AUTO_DIESEL: 320.00,
        SUPER_DIESEL: 340.00,
        KEROSENE: 295.00,
      };

      const prices: FuelPriceInfo[] = inventory.map(inv => ({
        fuelType: inv.fuelType,
        pricePerLiter: mockPrices[inv.fuelType] || 300.00,
        lastUpdated: new Date(),
        isActive: inv.currentStockLiters > 0,
      }));

      return prices;
    } catch (error) {
      logger.error(`Error fetching fuel station prices:`, error);
      throw handlePrismaError(error, 'fetching fuel station prices');
    }
  }
  /**
   * Update fuel station details
   */
  async updateFuelStation(
    stationId: string,
    updateData: Partial<{
      stationCode: string;
      name: string;
      phoneNumber: string;
      licenseNumber: string;
      isActive: boolean;
    }>
  ): Promise<FuelStationWithDetails> {
    try {
      const updatedStation = await this.prismaService.getClient().fuelStation.update({
        where: { id: stationId },
        data: updateData,
        include: {
          address: true,
          owner: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                },
              },
            },
          },
          fuelInventory: true,
          operators: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      });

      logger.info(`Fuel station updated successfully: ${updatedStation.name}`);
      return updatedStation as FuelStationWithDetails;
    } catch (error) {
      logger.error(`Error updating fuel station:`, error);
      throw handlePrismaError(error, 'updating fuel station');
    }
  }
  /**
   * Check if station code already exists (overloaded method)
   */
  async checkFuelStationExists(stationCode: string): Promise<boolean>;
  async checkFuelStationExists(stationCode: string, licenseNumber: string): Promise<{
    stationCodeExists: boolean;
    licenseNumberExists: boolean;
  }>;
  async checkFuelStationExists(stationCode: string, licenseNumber?: string): Promise<boolean | {
    stationCodeExists: boolean;
    licenseNumberExists: boolean;
  }> {
    if (licenseNumber === undefined) {
      // Single parameter version - just check station code
      try {
        const station = await this.prismaService.getClient().fuelStation.findUnique({ 
          where: { stationCode }, 
          select: { id: true } 
        });
        return !!station;
      } catch (error) {
        logger.error('Error checking fuel station existence:', error);
        throw handlePrismaError(error, 'checking fuel station existence');
      }
    }
    
    // Two parameter version - check both station code and license number
    try {
      const [stationByCode, stationByLicense] = await Promise.all([
        this.prismaService.getClient().fuelStation.findUnique({ 
          where: { stationCode }, 
          select: { id: true } 
        }),
        this.prismaService.getClient().fuelStation.findUnique({ 
          where: { licenseNumber }, 
          select: { id: true } 
        }),
      ]);

      return {
        stationCodeExists: !!stationByCode,
        licenseNumberExists: !!stationByLicense,
      };
    } catch (error) {
      logger.error('Error checking fuel station existence:', error);
      throw handlePrismaError(error, 'checking fuel station existence');
    }
  }

  /**
   * Deactivate a fuel station
   */
  async deactivateFuelStation(stationId: string): Promise<FuelStation> {
    try {
      const deactivatedStation = await this.prismaService.getClient().fuelStation.update({
        where: { id: stationId },
        data: { isActive: false },
      });

      logger.info(`Fuel station deactivated: ${deactivatedStation.name}`);
      return deactivatedStation;
    } catch (error) {
      logger.error(`Error deactivating fuel station:`, error);
      throw handlePrismaError(error, 'deactivating fuel station');
    }
  }
  /**
   * Search fuel stations by multiple criteria
   */
  async searchFuelStations(
    query: string,
    filters?: FuelStationSearchFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<FuelStationListResponse> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {
        isActive: true,
      };

      // Text search in name or station code
      if (query) {
        where.OR = [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            stationCode: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ];
      }

      // Apply additional filters
      if (filters?.district || filters?.province) {
        where.address = {};
        if (filters.district) {
          where.address.district = filters.district;
        }
        if (filters.province) {
          where.address.province = filters.province;
        }
      }

      // Fuel type availability filter
      if (filters?.fuelType) {
        where.fuelInventory = {
          some: {
            fuelType: filters.fuelType,
          },
        };
      }

      const [stations, total] = await Promise.all([
        this.prismaService.getClient().fuelStation.findMany({
          where,
          skip,
          take: limit,
          include: {
            address: true,
            owner: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                  },
                },
              },            },
            fuelInventory: true,
            operators: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { name: 'asc' },
          ],
        }),
        this.prismaService.getClient().fuelStation.count({ where }),
      ]);

      return {
        fuelStations: stations as FuelStationWithDetails[],
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error(`Error searching fuel stations:`, error);
      throw handlePrismaError(error, 'searching fuel stations');
    }
  }
}

export default FuelStationRepository;