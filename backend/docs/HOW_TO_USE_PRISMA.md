# How to Use Prisma in Your Repositories

This guide explains how to effectively use the Prisma setup in your application repositories without creating dedicated files.

## Basic Usage Pattern

Here's a simple pattern for using Prisma in your application:

```typescript
import { Database } from '../config/database';
import { handlePrismaError } from '../utils/prisma-middleware';

// Function that needs database access
async function someFunction() {
  const db = Database.getInstance();
  
  try {
    const result = await db.getClient().yourModel.findMany({
      where: { /* your conditions */ },
      include: { /* your relations */ }
    });
    
    return result;
  } catch (error) {
    throw handlePrismaError(error, 'finding records');
  }
}
```

## Using Transactions

For operations that require transactions:

```typescript
import { Database } from '../config/database';
import { handlePrismaError } from '../utils/prisma-middleware';

async function complexOperation(data: any) {
  const db = Database.getInstance();
  
  try {
    // This will automatically handle the transaction
    return await db.transaction(async (prisma) => {
      // Create main record
      const mainRecord = await prisma.mainModel.create({
        data: {
          name: data.name,
          // other fields...
        }
      });
      
      // Create related records
      const relatedRecords = await prisma.relatedModel.createMany({
        data: data.relatedItems.map(item => ({
          mainId: mainRecord.id,
          // other fields...
        }))
      });
      
      return { mainRecord, relatedRecords };
    });
  } catch (error) {
    throw handlePrismaError(error, 'complex operation');
  }
}
```

## Repository Pattern Implementation

If you prefer a repository pattern without creating repository files, you can use this approach:

```typescript
// Define your repository functions as needed
const userRepository = {
  findById: async (id: string) => {
    const db = Database.getInstance();
    try {
      return await db.getClient().user.findUnique({
        where: { id },
        include: { profile: true }
      });
    } catch (error) {
      throw handlePrismaError(error, 'finding user');
    }
  },
  
  create: async (userData: any) => {
    const db = Database.getInstance();
    try {
      return await db.getClient().user.create({
        data: userData
      });
    } catch (error) {
      throw handlePrismaError(error, 'creating user');
    }
  },
  
  // Add more methods as needed
};

// Then use it like this:
const user = await userRepository.findById('some-id');
```

## Example Vehicle Quota Implementation

Here's a specific implementation for your fuel quota management system:

```typescript
// Import database and error handling
import { Database } from '../config/database';
import { handlePrismaError } from '../utils/prisma-middleware';
import { VehicleType, FuelType } from '@prisma/client';

// Vehicle quota repository pattern
const vehicleQuotaRepository = {
  // Get quota for a specific vehicle
  getQuota: async (vehicleId: string) => {
    const db = Database.getInstance();
    try {
      return await db.getClient().vehicleQuota.findUnique({
        where: { vehicleId },
        include: {
          vehicle: true,
          fuelType: true
        }
      });
    } catch (error) {
      throw handlePrismaError(error, 'getting vehicle quota');
    }
  },
  
  // Update quota after fuel consumption
  updateQuotaAfterConsumption: async (vehicleId: string, amountUsed: number) => {
    const db = Database.getInstance();
    
    try {
      // Use transaction to ensure data consistency
      return await db.transaction(async (prisma) => {
        // Get current quota
        const currentQuota = await prisma.vehicleQuota.findUnique({
          where: { vehicleId }
        });
        
        if (!currentQuota) {
          throw new Error('Vehicle quota not found');
        }
        
        if (currentQuota.remainingQuota < amountUsed) {
          throw new Error('Insufficient quota remaining');
        }
        
        // Update remaining quota
        const updatedQuota = await prisma.vehicleQuota.update({
          where: { vehicleId },
          data: {
            remainingQuota: currentQuota.remainingQuota - amountUsed,
            lastUpdated: new Date()
          }
        });
        
        // Record transaction
        const transaction = await prisma.fuelTransaction.create({
          data: {
            vehicleId,
            amountDispensed: amountUsed,
            transactionDate: new Date(),
            status: 'COMPLETED',
            stationId: '123', // Replace with actual station ID
          }
        });
        
        return { updatedQuota, transaction };
      });
    } catch (error) {
      throw handlePrismaError(error, 'updating quota after consumption');
    }
  },
  
  // Reset all quotas for monthly allocation
  resetMonthlyQuotas: async () => {
    const db = Database.getInstance();
    
    try {
      return await db.transaction(async (prisma) => {
        // Get all vehicle types with their allocated quotas
        const vehicleTypes = await prisma.vehicleType.findMany({
          include: { defaultQuota: true }
        });
        
        // Update each vehicle's quota
        const results = await Promise.all(
          vehicleTypes.map(async (type) => {
            return prisma.vehicleQuota.updateMany({
              where: { 
                vehicle: {
                  type: type.name as VehicleType
                }
              },
              data: {
                totalQuota: type.defaultQuota?.amount || 0,
                remainingQuota: type.defaultQuota?.amount || 0,
                lastReset: new Date()
              }
            });
          })
        );
        
        return { updated: results.reduce((sum, result) => sum + result.count, 0) };
      });
    } catch (error) {
      throw handlePrismaError(error, 'resetting monthly quotas');
    }
  }
};

// Usage in your application:
// const quota = await vehicleQuotaRepository.getQuota('vehicle-1');
// await vehicleQuotaRepository.updateQuotaAfterConsumption('vehicle-1', 5);
```

## Best Practices

1. **Always use the singleton instance** of Database to avoid creating multiple connections
2. **Use transactions** for operations that modify multiple records
3. **Handle errors properly** with the handlePrismaError utility
4. **Keep your repository functions focused** on a single responsibility
5. **Include proper type definitions** for all parameters and return values

## Error Handling

The system includes sophisticated error handling for Prisma operations:

- Unique constraint violations
- Foreign key constraint failures
- Records not found
- Required field validation
- Connection issues
- Generic database errors

Each error is properly logged and transformed into a user-friendly message.
