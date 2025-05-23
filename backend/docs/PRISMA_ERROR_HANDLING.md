# Common Prisma Errors and How to Handle Them

This guide provides solutions to common Prisma errors you might encounter and how to handle them effectively.

## Connection Errors

### Unable to connect to the database

**Error Message:**
```
Error: P1001: Can't reach database server at `localhost`:`5432`
```

**Solution:**
1. Verify your database server is running
2. Check if the credentials in your `.env` file are correct
3. Make sure the port is not blocked by a firewall
4. If using a cloud database, check network access rules

**Implementation:**
```typescript
try {
  await prisma.$connect();
} catch (error: any) {
  if (error.code === 'P1001') {
    console.error('Database connection failed: Check if database server is running');
    // Implement retry logic or fail gracefully
  }
}
```

## Data Validation Errors

### Unique constraint violation

**Error Message:**
```
Error: P2002: Unique constraint failed on the fields: (`email`)
```

**Solution:**
Check if the record with the unique field already exists before creating or updating.

**Implementation:**
```typescript
try {
  return await prisma.user.create({
    data: userData
  });
} catch (error: any) {
  if (error.code === 'P2002') {
    const field = error.meta?.target[0];
    throw new Error(`A user with this ${field} already exists`);
  }
  throw error;
}
```

### Required field missing

**Error Message:**
```
Error: P2012: Missing a required value at `User.email`
```

**Solution:**
Validate all required fields before sending to Prisma.

**Implementation:**
```typescript
function validateUserData(data: any) {
  const requiredFields = ['email', 'name', 'roleId'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Field '${field}' is required`);
    }
  }
}

try {
  validateUserData(userData);
  return await prisma.user.create({
    data: userData
  });
} catch (error: any) {
  if (error.code === 'P2012') {
    const field = error.meta?.path;
    throw new Error(`Required field missing: ${field}`);
  }
  throw error;
}
```

### Foreign key constraint failed

**Error Message:**
```
Error: P2003: Foreign key constraint failed on the field: `userId`
```

**Solution:**
Verify that related records exist before creating records with foreign keys.

**Implementation:**
```typescript
async function createVehicle(vehicleData) {
  // First check if user exists
  const userExists = await prisma.user.findUnique({ 
    where: { id: vehicleData.userId }
  });
  
  if (!userExists) {
    throw new Error(`User with ID ${vehicleData.userId} does not exist`);
  }
  
  // Then create vehicle
  return await prisma.vehicle.create({
    data: vehicleData
  });
}
```

## Query Errors

### Record not found

**Error Message:**
```
Error: P2025: Record to update not found.
```

**Solution:**
Check if records exist before updating or deleting them.

**Implementation:**
```typescript
async function updateVehicle(id, data) {
  // First check if vehicle exists
  const vehicle = await prisma.vehicle.findUnique({ 
    where: { id }
  });
  
  if (!vehicle) {
    throw new Error(`Vehicle with ID ${id} not found`);
  }
  
  // Then update
  return await prisma.vehicle.update({
    where: { id },
    data
  });
}
```

### Invalid arguments

**Error Message:**
```
Error: P2009: Invalid argument value. Expected a valid `OrderByInput` for type `UserOrderByInput`
```

**Solution:**
Validate arguments before passing them to Prisma queries.

**Implementation:**
```typescript
function validateSortParams(sortField, sortDirection) {
  const validFields = ['createdAt', 'name', 'email', 'role'];
  const validDirections = ['asc', 'desc'];
  
  if (!validFields.includes(sortField)) {
    throw new Error(`Invalid sort field: ${sortField}`);
  }
  
  if (!validDirections.includes(sortDirection)) {
    throw new Error(`Invalid sort direction: ${sortDirection}`);
  }
}

async function getUsers(sortField = 'createdAt', sortDirection = 'desc') {
  try {
    validateSortParams(sortField, sortDirection);
    
    return await prisma.user.findMany({
      orderBy: { [sortField]: sortDirection }
    });
  } catch (error) {
    throw handlePrismaError(error, 'getting users');
  }
}
```

## Transaction Errors

### Transaction timeout

**Error Message:**
```
Error: P2034: Transaction failed due to a write conflict or a deadlock. Please retry your transaction
```

**Solution:**
Implement retry logic for transactions.

**Implementation:**
```typescript
async function executeWithRetry(fn, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.code === 'P2034' && retries < maxRetries - 1) {
        // Wait for a short random time before retrying
        const delay = Math.floor(Math.random() * 500) + 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        throw error;
      }
    }
  }
}

// Usage
await executeWithRetry(async () => {
  return await prisma.$transaction([
    prisma.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } }),
    prisma.account.update({ where: { id: 2 }, data: { balance: { increment: 100 } } })
  ]);
});
```

## Migration Errors

### Schema drift detected

**Error Message:**
```
Error: P4001: The migration contains destructive changes and can't be applied automatically
```

**Solution:**
Use the `--force` flag with caution, or modify your migrations to be non-destructive.

**Implementation:**
```bash
# For development environments only
npx prisma migrate reset --force
npx prisma migrate dev --name modified_schema
```

## Performance Issues

### Slow queries

**Problem:**
Queries taking too long to execute.

**Solution:**
Use pagination, select only needed fields, use efficient filtering.

**Implementation:**
```typescript
// Bad: Loading all transactions
const allTransactions = await prisma.fuelTransaction.findMany({
  include: { vehicle: true, user: true, station: true }
});

// Good: Using pagination and selecting specific fields
const paginatedTransactions = await prisma.fuelTransaction.findMany({
  take: 20,
  skip: (page - 1) * 20,
  select: {
    id: true,
    amount: true,
    transactionDate: true,
    vehicle: {
      select: { registrationNumber: true }
    },
    user: {
      select: { name: true }
    }
  },
  where: {
    transactionDate: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  },
  orderBy: { transactionDate: 'desc' }
});
```

## General Best Practices

### Use proper error handling

```typescript
/**
 * Generic function to handle Prisma operations with error handling
 * @param operation The database operation to perform
 * @param operationName Name of the operation for logging
 */
async function handlePrismaOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Handle specific Prisma errors
    if (error.code) {
      switch (error.code) {
        case 'P2002':
          throw new Error(`Duplicate entry for ${error.meta?.target[0]}`);
        case 'P2025':
          throw new Error(`Record not found during ${operationName}`);
        case 'P2003':
          throw new Error(`Related record not found for ${error.meta?.field_name}`);
        default:
          console.error(`Prisma error during ${operationName}:`, error);
          throw new Error(`Database error during ${operationName}`);
      }
    }
    
    // Handle general errors
    console.error(`Error during ${operationName}:`, error);
    throw new Error(`Failed to ${operationName}`);
  }
}

// Usage
async function getUserById(id: string) {
  return handlePrismaOperation(
    () => prisma.user.findUnique({ where: { id } }),
    'getting user by ID'
  );
}
```

### Implement middleware for logging and debugging

```typescript
// Add this in your main application setup
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
  
  return result;
});
```

### Connection management

```typescript
// Proper shutdown of the Prisma client
process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
```

By following these solutions, you can handle common Prisma errors effectively and improve the reliability of your application.
