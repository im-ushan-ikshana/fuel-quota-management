// This is a sample implementation file showing how to use Prisma
// You can copy and adapt these patterns without creating specific repository files

// NOTE: In a production application, you would typically create a repository layer
// that encapsulates all database operations including error handling.
// This example file demonstrates direct usage of the PrismaService with explicit error handling.

import PrismaService from './services/prisma.services';
import { handlePrismaError } from './utils/prisma.middleware';
import { Prisma } from '@prisma/client';

// Define the types based on our normalized schema
type User = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber: string;
  userType: string;
  isActive: boolean;
  // Add other fields as needed
};

type VehicleOwner = {
  id: string;
  userId: string;
  registrationDate: Date;
  // Add other fields as needed
};

type Vehicle = {
  id: string;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  // Add other fields as needed
};

type FuelTransaction = {
  id: string;
  transactionNumber: string;
  fuelType: any;
  quantity: number;
  // Add other fields as needed
};

/**
 * Example of using Prisma directly with error handling - now with normalized User model
 */
export async function getUserById(userId: string): Promise<User | null> {
  const prismaService = PrismaService.getInstance();
  
  try {
    return await prismaService.getClient().user.findUnique({
      where: { id: userId },
      include: {
        address: true,
        vehicleOwner: true,
        fuelStationOwner: true,
        fuelStationOperator: true,
        adminUser: true
      }
    });
  } catch (error) {
    throw handlePrismaError(error, 'getting user by ID');
  }
}

/**
 * Example of getting a vehicle owner with user details
 */
export async function getVehicleOwnerById(vehicleOwnerId: string): Promise<VehicleOwner | null> {
  const prismaService = PrismaService.getInstance();
  
  try {
    return await prismaService.getClient().vehicleOwner.findUnique({
      where: { id: vehicleOwnerId },
      include: {
        user: {
          include: {
            address: true
          }
        },
        vehicles: true
      }
    });
  } catch (error) {
    throw handlePrismaError(error, 'getting vehicle owner by ID');
  }
}

/**
 * Example of using transactions with Prisma - Updated for normalized User model
 */
export async function createUserWithVehicle(
  userData: { email: string; password: string; firstName: string; lastName: string; phoneNumber: string; nicNumber: string; addressId: string }, 
  vehicleData: any
): Promise<{ user: User; vehicleOwner: VehicleOwner; vehicle: Vehicle }> {
  const prismaService = PrismaService.getInstance();
  try {
    return await prismaService.transaction(async (prisma: Prisma.TransactionClient) => {
      // Create user first
      const user = await prisma.user.create({
        data: {
          ...userData,
          userType: 'VEHICLE_OWNER'
        }
      });
      
      // Create vehicle owner profile
      const vehicleOwner = await prisma.vehicleOwner.create({
        data: {
          userId: user.id
        }
      });
      
      // Create vehicle and associate it with the vehicle owner
      const vehicle = await prisma.vehicle.create({
        data: {
          ...vehicleData,
          ownerId: vehicleOwner.id
        }
      });
      
      return { user, vehicleOwner, vehicle };
    });
  } catch (error) {
    throw handlePrismaError(error, 'creating user with vehicle');
  }
}

/**
 * Example of creating a fuel station owner with normalized User model
 */
export async function createFuelStationOwner(
  userData: { email: string; password: string; firstName: string; lastName: string; phoneNumber: string; nicNumber: string; addressId: string },
  fuelStationOwnerData: { businessRegNo: string; businessName: string }
) {
  const prismaService = PrismaService.getInstance();
  try {
    return await prismaService.transaction(async (prisma: Prisma.TransactionClient) => {
      // Create user first
      const user = await prisma.user.create({
        data: {
          ...userData,
          userType: 'FUEL_STATION_OWNER'
        }
      });
      
      // Create fuel station owner profile
      const fuelStationOwner = await prisma.fuelStationOwner.create({
        data: {
          userId: user.id,
          ...fuelStationOwnerData
        }
      });
      
      return { user, fuelStationOwner };
    });
  } catch (error) {
    throw handlePrismaError(error, 'creating fuel station owner');
  }
}

/**
 * Example of creating an admin user with normalized User model
 */
export async function createAdminUser(
  userData: { email: string; password: string; firstName: string; lastName: string; phoneNumber: string; nicNumber: string; addressId: string }
) {
  const prismaService = PrismaService.getInstance();
  try {
    return await prismaService.transaction(async (prisma: Prisma.TransactionClient) => {
      // Create user first
      const user = await prisma.user.create({
        data: {
          ...userData,
          userType: 'ADMIN_USER'
        }
      });
      
      // Create admin user profile
      const adminUser = await prisma.adminUser.create({
        data: {
          userId: user.id
        }
      });
      
      return { user, adminUser };
    });
  } catch (error) {
    throw handlePrismaError(error, 'creating admin user');
  }
}

/**
 * Example of getting users by type
 */
export async function getUsersByType(userType: string) {
  const prismaService = PrismaService.getInstance();
  try {
    return await prismaService.getClient().user.findMany({
      where: { 
        userType: userType as any,
        isActive: true 
      },
      include: {
        address: true,
        vehicleOwner: userType === 'VEHICLE_OWNER',
        fuelStationOwner: userType === 'FUEL_STATION_OWNER',
        fuelStationOperator: userType === 'FUEL_STATION_OPERATOR',
        adminUser: userType === 'ADMIN_USER'
      }
    });
  } catch (error) {
    throw handlePrismaError(error, 'getting users by type');
  }
}

/**
 * Repository pattern example for Fuel Station operations
 */
export const fuelStationRepository = {
  findAll: async () => {
    const prismaService = PrismaService.getInstance();
    try {
      return await prismaService.getClient().fuelStation.findMany({
        include: {
          address: true,
          fuelInventory: true
        }
      });
    } catch (error) {
      throw handlePrismaError(error, 'finding all fuel stations');
    }
  },
    findById: async (stationId: string) => {
    const prismaService = PrismaService.getInstance();
    try {
      return await prismaService.getClient().fuelStation.findUnique({
        where: { id: stationId },
        include: {
          address: true,
          fuelInventory: true,
          // operatingHours is stored as Json field in the schema, not a relation
          operators: true
        }
      });
    } catch (error) {
      throw handlePrismaError(error, 'finding fuel station by ID');
    }
  },  updateInventory: async (stationId: string, fuelType: any, quantity: number) => {
    const prismaService = PrismaService.getInstance();
    try {
      return await prismaService.transaction(async (prisma: Prisma.TransactionClient) => {
        // Find current inventory
        const currentInventory = await prisma.fuelInventory.findFirst({
          where: {
            fuelStationId: stationId,
            fuelType: fuelType
          }
        });
        
        if (!currentInventory) {
          // Create new inventory record if it doesn't exist
          return await prisma.fuelInventory.create({
            data: {
              fuelStationId: stationId,
              fuelType: fuelType,
              currentStock: quantity,
              minimumLevel: 0,
              maximumLevel: 1000,
              lastUpdated: new Date()
            }
          });
        } else {
          // Update existing inventory
          return await prisma.fuelInventory.update({
            where: { id: currentInventory.id },
            data: {
              currentStock: currentInventory.currentStock + quantity,
              lastUpdated: new Date()
            }
          });
        }
      });
    } catch (error) {
      throw handlePrismaError(error, 'updating fuel station inventory');
    }
  }
};

/**
 * Implementing a query with filtering, pagination and sorting
 */
export async function searchTransactions(
  filters: { 
    fuelStationId?: string; 
    vehicleId?: string; 
    startDate?: Date; 
    endDate?: Date;
    minQuantity?: number;
    status?: string;
  },
  pagination: { page: number; pageSize: number },
  sorting: { field: string; direction: 'asc' | 'desc' }
): Promise<{ data: FuelTransaction[]; total: number; page: number; pageSize: number }> {
  const prismaService = PrismaService.getInstance();
  const { page, pageSize } = pagination;
  const skip = (page - 1) * pageSize;
  
  try {
    // Build where clause based on filters
    const where: any = {};
    
    if (filters.fuelStationId) where.fuelStationId = filters.fuelStationId;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    
    // Date range
    if (filters.startDate || filters.endDate) {
      where.transactionDate = {};
      if (filters.startDate) where.transactionDate.gte = filters.startDate;
      if (filters.endDate) where.transactionDate.lte = filters.endDate;
    }
    
    // Amount filter
    if (filters.minQuantity) where.quantity = { gte: filters.minQuantity };
    
    // Status filter
    if (filters.status) where.status = filters.status;
    
    // Execute query with pagination and sorting
    const [data, total] = await prismaService.transaction(async (prisma: Prisma.TransactionClient) => {
      const transactions = await prisma.fuelTransaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sorting.field]: sorting.direction },
        include: {
          vehicle: true,
          fuelStation: true,
          operator: true
        }
      });
      
      const count = await prisma.fuelTransaction.count({ where });
      
      return [transactions, count];
    });
    
    return {
      data,
      total,
      page,
      pageSize
    };
  } catch (error) {
    throw handlePrismaError(error, 'searching transactions');
  }
}

/**
 * Example of complex reporting query
 */
export async function generateMonthlyReport(year: number, month: number) {
  const prismaService = PrismaService.getInstance();
    try {
    const startDate = new Date(year, month - 1, 1); // JS months are 0-indexed
    const endDate = new Date(year, month, 0); // Last day of month
    
    return await prismaService.transaction(async (prisma: Prisma.TransactionClient) => {
      // Aggregate fuel consumption by type
      const fuelConsumption = await prisma.fuelTransaction.groupBy({
        by: ['fuelType'],
        where: {
          transactionDate: {
            gte: startDate,
            lte: endDate
          },
          status: 'COMPLETED'
        },
        _sum: {
          quantity: true
        }
      });
      
      // Get station with most transactions
      const stationTransactions = await prisma.fuelTransaction.groupBy({
        by: ['fuelStationId'],
        where: {
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      });
      
      // Get vehicle type distribution
      const vehicleTypeDistribution = await prisma.$queryRaw`
        SELECT v."vehicleType", COUNT(ft.id) as transaction_count, SUM(ft."quantity") as total_fuel
        FROM "fuel_transactions" ft
        JOIN "vehicles" v ON ft."vehicleId" = v.id
        WHERE ft."transactionDate" BETWEEN ${startDate} AND ${endDate}
        GROUP BY v."vehicleType"
        ORDER BY total_fuel DESC
      `;
      
      return {
        period: `${year}-${month.toString().padStart(2, '0')}`,
        fuelConsumption,
        topStation: stationTransactions[0] || null,
        vehicleTypeDistribution
      };
    });
  } catch (error) {
    throw handlePrismaError(error, 'generating monthly report');
  }
}
