# Prisma Best Practices and Usage Examples

This document provides practical examples and best practices for using Prisma in your fuel quota management system.

## Connecting to Prisma in Your Code

Always use the Database singleton to access Prisma:

```typescript
import { Database } from './config/database';

// Get database instance
const db = Database.getInstance();

// Get Prisma client
const prisma = db.getClient();
```

## Basic CRUD Operations with Error Handling

### Finding Records

```typescript
// Get a single user by ID
export async function getUserById(id: string) {
  const db = Database.getInstance();
  
  try {
    return await db.getClient().user.findUnique({
      where: { id },
      include: { 
        profile: true,
        vehicles: true 
      }
    });
  } catch (error) {
    throw handlePrismaError(error, 'finding user by ID');
  }
}

// Get all vehicles for a user
export async function getUserVehicles(userId: string) {
  const db = Database.getInstance();
  
  try {
    return await db.getClient().vehicle.findMany({
      where: { userId },
      include: { 
        vehicleQuota: true,
        fuelType: true
      }
    });
  } catch (error) {
    throw handlePrismaError(error, 'getting user vehicles');
  }
}
```

### Creating Records

```typescript
// Register a new user
export async function createUser(userData: any) {
  const db = Database.getInstance();
  
  try {
    return await db.getClient().user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role || 'USER',
        profile: {
          create: {
            address: userData.address,
            phoneNumber: userData.phoneNumber,
            // other profile fields
          }
        }
      }
    });
  } catch (error) {
    throw handlePrismaError(error, 'creating user');
  }
}
```

### Updating Records

```typescript
// Update user profile
export async function updateUserProfile(userId: string, profileData: any) {
  const db = Database.getInstance();
  
  try {
    return await db.getClient().profile.update({
      where: { userId },
      data: profileData
    });
  } catch (error) {
    throw handlePrismaError(error, 'updating user profile');
  }
}
```

### Deleting Records

```typescript
// Delete a vehicle
export async function deleteVehicle(vehicleId: string) {
  const db = Database.getInstance();
  
  try {
    // Use a transaction to delete related records first
    return await db.transaction(async (prisma) => {
      // Delete related quotas
      await prisma.vehicleQuota.deleteMany({
        where: { vehicleId }
      });
      
      // Delete related transactions
      await prisma.fuelTransaction.deleteMany({
        where: { vehicleId }
      });
      
      // Delete the vehicle
      return await prisma.vehicle.delete({
        where: { id: vehicleId }
      });
    });
  } catch (error) {
    throw handlePrismaError(error, 'deleting vehicle');
  }
}
```

## Using Transactions for Complex Operations

Transactions are critical for maintaining data integrity across multiple operations:

```typescript
// Process a fuel dispensing transaction
export async function processFuelTransaction(transactionData: any) {
  const db = Database.getInstance();
  
  try {
    return await db.transaction(async (prisma) => {
      // 1. Verify vehicle quota
      const quota = await prisma.vehicleQuota.findUnique({
        where: { vehicleId: transactionData.vehicleId }
      });
      
      if (!quota) {
        throw new Error('Vehicle quota not found');
      }
      
      if (quota.remainingQuota < transactionData.amount) {
        throw new Error('Insufficient quota remaining');
      }
      
      // 2. Check fuel station inventory
      const inventory = await prisma.fuelInventory.findFirst({
        where: {
          stationId: transactionData.stationId,
          fuelTypeId: transactionData.fuelTypeId
        }
      });
      
      if (!inventory || inventory.quantity < transactionData.amount) {
        throw new Error('Insufficient fuel inventory at station');
      }
      
      // 3. Update vehicle quota
      const updatedQuota = await prisma.vehicleQuota.update({
        where: { vehicleId: transactionData.vehicleId },
        data: {
          remainingQuota: quota.remainingQuota - transactionData.amount,
          lastUpdated: new Date()
        }
      });
      
      // 4. Update station inventory
      const updatedInventory = await prisma.fuelInventory.update({
        where: { id: inventory.id },
        data: {
          quantity: inventory.quantity - transactionData.amount,
          lastUpdated: new Date()
        }
      });
      
      // 5. Create transaction record
      const transaction = await prisma.fuelTransaction.create({
        data: {
          vehicleId: transactionData.vehicleId,
          stationId: transactionData.stationId,
          fuelTypeId: transactionData.fuelTypeId,
          amountDispensed: transactionData.amount,
          transactionDate: new Date(),
          status: 'COMPLETED',
          // other transaction fields
        }
      });
      
      return {
        transaction,
        updatedQuota,
        updatedInventory
      };
    });
  } catch (error) {
    throw handlePrismaError(error, 'processing fuel transaction');
  }
}
```

## Working with Relations

Prisma makes it easy to work with related data:

```typescript
// Get all stations with their inventories and recent transactions
export async function getStationsWithDetails() {
  const db = Database.getInstance();
  
  try {
    return await db.getClient().fuelStation.findMany({
      include: {
        location: true,
        inventory: {
          include: {
            fuelType: true
          }
        },
        transactions: {
          take: 10,
          orderBy: {
            transactionDate: 'desc'
          }
        }
      }
    });
  } catch (error) {
    throw handlePrismaError(error, 'getting stations with details');
  }
}
```

## Advanced Filtering and Pagination

```typescript
// Search vehicles with filtering and pagination
export async function searchVehicles(
  filters: any,
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'createdAt',
  sortDir: 'asc' | 'desc' = 'desc'
) {
  const db = Database.getInstance();
  const skip = (page - 1) * pageSize;
  
  // Build where clause
  const where: any = {};
  
  if (filters.registrationNumber) {
    where.registrationNumber = {
      contains: filters.registrationNumber,
      mode: 'insensitive'
    };
  }
  
  if (filters.type) {
    where.type = filters.type;
  }
  
  if (filters.fuelTypeId) {
    where.fuelTypeId = filters.fuelTypeId;
  }
  
  try {
    // Get records and total count in parallel
    const [vehicles, total] = await Promise.all([
      db.getClient().vehicle.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortDir },
        include: {
          user: true,
          vehicleQuota: true,
          fuelType: true
        }
      }),
      db.getClient().vehicle.count({ where })
    ]);
    
    return {
      data: vehicles,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    throw handlePrismaError(error, 'searching vehicles');
  }
}
```

## Implementing Repository Pattern without Repository Files

You can create objects that encapsulate data access operations without creating dedicated files:

```typescript
// In any file that needs user operations
const userOperations = {
  getById: async (id: string) => {
    const db = Database.getInstance();
    try {
      return await db.getClient().user.findUnique({ where: { id } });
    } catch (error) {
      throw handlePrismaError(error, 'getting user by ID');
    }
  },
  
  create: async (data: any) => {
    const db = Database.getInstance();
    try {
      return await db.getClient().user.create({ data });
    } catch (error) {
      throw handlePrismaError(error, 'creating user');
    }
  },
  
  update: async (id: string, data: any) => {
    const db = Database.getInstance();
    try {
      return await db.getClient().user.update({ 
        where: { id },
        data 
      });
    } catch (error) {
      throw handlePrismaError(error, 'updating user');
    }
  },
  
  delete: async (id: string) => {
    const db = Database.getInstance();
    try {
      return await db.getClient().user.delete({ where: { id } });
    } catch (error) {
      throw handlePrismaError(error, 'deleting user');
    }
  }
};

// Usage
const user = await userOperations.getById('123');
```

## Raw SQL for Complex Queries

Sometimes you need to use raw SQL for complex operations:

```typescript
// Get fuel consumption statistics by region and vehicle type
export async function getFuelConsumptionStats(year: number, month: number) {
  const db = Database.getInstance();
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  try {
    const results = await db.getClient().$queryRaw`
      SELECT 
        l.province, 
        v.type AS vehicle_type,
        ft.fuel_type_id,
        SUM(ft.amount_dispensed) AS total_consumed,
        COUNT(DISTINCT v.id) AS vehicle_count
      FROM 
        fuel_transaction ft
      JOIN 
        vehicle v ON ft.vehicle_id = v.id
      JOIN 
        fuel_station fs ON ft.station_id = fs.id
      JOIN 
        location l ON fs.location_id = l.id
      WHERE 
        ft.transaction_date BETWEEN ${startDate} AND ${endDate}
        AND ft.status = 'COMPLETED'
      GROUP BY 
        l.province, v.type, ft.fuel_type_id
      ORDER BY 
        l.province, total_consumed DESC
    `;
    
    return results;
  } catch (error) {
    throw handlePrismaError(error, 'getting fuel consumption stats');
  }
}
```

## Batch Operations

For performance-critical operations involving many records:

```typescript
// Reset all vehicle quotas for a new allocation period
export async function resetAllVehicleQuotas() {
  const db = Database.getInstance();
  
  try {
    return await db.transaction(async (prisma) => {
      // Get default quota values by vehicle type
      const quotaDefaults = await prisma.vehicleTypeQuota.findMany();
      
      // Create mapping for quick lookup
      const quotaMap = quotaDefaults.reduce((map, item) => {
        map[item.vehicleType] = item.defaultQuota;
        return map;
      }, {} as Record<string, number>);
      
      // Get all vehicles grouped by type
      const vehicleTypes = await prisma.vehicle.groupBy({
        by: ['type'],
        _count: true
      });
      
      // Reset quotas for each vehicle type
      const results = await Promise.all(
        vehicleTypes.map(async (vt) => {
          const defaultQuota = quotaMap[vt.type] || 0;
          
          return prisma.vehicleQuota.updateMany({
            where: {
              vehicle: {
                type: vt.type
              }
            },
            data: {
              totalQuota: defaultQuota,
              remainingQuota: defaultQuota,
              lastReset: new Date()
            }
          });
        })
      );
      
      const totalUpdated = results.reduce((sum, r) => sum + r.count, 0);
      
      return { updated: totalUpdated };
    });
  } catch (error) {
    throw handlePrismaError(error, 'resetting vehicle quotas');
  }
}
```

## Error Handling Best Practices

Always wrap Prisma operations in try-catch blocks and use the handlePrismaError utility:

```typescript
try {
  // Your Prisma operations
} catch (error) {
  // Use the handlePrismaError utility for consistent error handling
  throw handlePrismaError(error, 'descriptive operation name');
}
```
