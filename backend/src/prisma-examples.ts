// This is a sample implementation file showing how to use Prisma
// You can copy and adapt these patterns without creating specific repository files

// NOTE: In a production application, you would typically create a repository layer
// that encapsulates all database operations including error handling.
// This example file demonstrates direct usage of the Database class with explicit error handling.

import { Database } from './config/database';
import { handlePrismaError } from './utils/prisma.middleware';
import { PrismaClient, Prisma } from '@prisma/client';

// Define the types based on our schema
type VehicleOwner = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber: string;
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
 * Example of using Prisma directly with error handling
 */
export async function getUserById(userId: string): Promise<VehicleOwner | null> {
  const db = Database.getInstance();
  
  try {
    return await db.getClient().vehicleOwner.findUnique({
      where: { id: userId }
    });
  } catch (error) {
    throw handlePrismaError(error, 'getting user by ID');
  }
}

/**
 * Example of using transactions with Prisma
 */
export async function createUserWithVehicle(userData: any, vehicleData: any): Promise<{ user: VehicleOwner; vehicle: Vehicle }> {
  const db = Database.getInstance();
    try {
    return await db.transaction(async (prisma: Prisma.TransactionClient) => {
      // Create user
      const user = await prisma.vehicleOwner.create({
        data: userData
      });
      
      // Create vehicle and associate it with the user
      const vehicle = await prisma.vehicle.create({
        data: {
          ...vehicleData,
          ownerId: user.id  // Note: changed from userId to ownerId based on the schema
        }
      });
      
      return { user, vehicle };
    });
  } catch (error) {
    throw handlePrismaError(error, 'creating user with vehicle');
  }
}

/**
 * Repository pattern example for Fuel Station operations
 */
export const fuelStationRepository = {
  findAll: async () => {
    const db = Database.getInstance();
    try {
      return await db.getClient().fuelStation.findMany({
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
    const db = Database.getInstance();
    try {
      return await db.getClient().fuelStation.findUnique({
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
  },
  updateInventory: async (stationId: string, fuelType: any, quantity: number) => {
    const db = Database.getInstance();
    try {
      return await db.transaction(async (prisma: Prisma.TransactionClient) => {
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
  const db = Database.getInstance();
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
    const [data, total] = await db.transaction(async (prisma: Prisma.TransactionClient) => {
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
  const db = Database.getInstance();
    try {
    const startDate = new Date(year, month - 1, 1); // JS months are 0-indexed
    const endDate = new Date(year, month, 0); // Last day of month
    
    return await db.transaction(async (prisma: Prisma.TransactionClient) => {
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
