import { PrismaClient } from '@prisma/client';
import { 
  VehicleType, 
  FuelType, 
  UserType, 
  Province, 
  District 
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {    // Clean existing data (in reverse dependency order)
    console.log('🗑️ Cleaning existing data...');
    await prisma.fuelTransaction.deleteMany();
    await prisma.fuelInventory.deleteMany();
    await prisma.dMTValidation.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.vehicleOwner.deleteMany();
    await prisma.fuelStationOperator.deleteMany();
    await prisma.fuelStation.deleteMany();
    await prisma.fuelStationOwner.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.userRole_Assignment.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.address.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.quotaSettings.deleteMany();
    await prisma.smsLog.deleteMany();

    // 1. Create Addresses first (no dependencies)
    console.log('📍 Creating addresses...');
    const addresses = await Promise.all([
      prisma.address.create({
        data: {
          addressLine1: '123 Galle Road',
          addressLine2: 'Colombo 03',
          city: 'Colombo',
          district: District.COLOMBO,
          province: Province.WESTERN,
        },
      }),
      prisma.address.create({
        data: {
          addressLine1: '456 Kandy Road',
          city: 'Kandy',
          district: District.KANDY,
          province: Province.CENTRAL,
        },
      }),
      prisma.address.create({
        data: {
          addressLine1: '789 Main Street',
          addressLine2: 'Matara Town',
          city: 'Matara',
          district: District.MATARA,
          province: Province.SOUTHERN,
        },
      }),
      prisma.address.create({
        data: {
          addressLine1: '321 Temple Road',
          city: 'Jaffna',
          district: District.JAFFNA,
          province: Province.NORTHERN,
        },
      }),
      prisma.address.create({
        data: {
          addressLine1: '654 Beach Road',
          city: 'Batticaloa',
          district: District.BATTICALOA,
          province: Province.EASTERN,
        },
      }),
    ]);

    // 2. Create Roles
    console.log('👥 Creating roles...');
    const adminRole = await prisma.role.create({
      data: {
        name: 'Super Admin',
        description: 'Full system access and control',
      },
    });

    const stationOwnerRole = await prisma.role.create({
      data: {
        name: 'Fuel Station Owner',
        description: 'Fuel station owner permissions',
      },
    });

    const operatorRole = await prisma.role.create({
      data: {
        name: 'Fuel Station Operator',
        description: 'Fuel station operator permissions',
      },
    });

    const vehicleOwnerRole = await prisma.role.create({
      data: {
        name: 'Vehicle Owner',
        description: 'Vehicle owner permissions',
      },
    });

    // 3. Create Permissions
    console.log('🔐 Creating permissions...');
    const permissions = await Promise.all([
      // User management permissions
      prisma.permission.create({
        data: {
          name: 'Create User',
          module: 'USER',
          action: 'CREATE',
          description: 'Create new users',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Read User',
          module: 'USER',
          action: 'READ',
          description: 'View user information',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Update User',
          module: 'USER',
          action: 'UPDATE',
          description: 'Update user information',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Delete User',
          module: 'USER',
          action: 'DELETE',
          description: 'Delete users',
        },
      }),
      // Vehicle management permissions
      prisma.permission.create({
        data: {
          name: 'Create Vehicle',
          module: 'VEHICLE',
          action: 'CREATE',
          description: 'Register new vehicles',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Read Vehicle',
          module: 'VEHICLE',
          action: 'READ',
          description: 'View vehicle information',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Update Vehicle',
          module: 'VEHICLE',
          action: 'UPDATE',
          description: 'Update vehicle information',
        },
      }),
      // Fuel station permissions
      prisma.permission.create({
        data: {
          name: 'Manage Fuel Station',
          module: 'FUEL_STATION',
          action: 'MANAGE',
          description: 'Manage fuel station operations',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Process Transaction',
          module: 'TRANSACTION',
          action: 'CREATE',
          description: 'Process fuel transactions',
        },
      }),
      // Admin permissions
      prisma.permission.create({
        data: {
          name: 'System Admin',
          module: 'SYSTEM',
          action: 'ADMIN',
          description: 'Full system administration',
        },
      }),
    ]);

    // 4. Assign permissions to roles
    console.log('🔗 Assigning permissions to roles...');
    // Admin gets all permissions
    for (const permission of permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }

    // Station owner gets station and transaction permissions
    await prisma.rolePermission.create({
      data: {
        roleId: stationOwnerRole.id,
        permissionId: permissions.find(p => p.name === 'Manage Fuel Station')!.id,
      },
    });

    // Operator gets transaction permissions
    await prisma.rolePermission.create({
      data: {
        roleId: operatorRole.id,
        permissionId: permissions.find(p => p.name === 'Process Transaction')!.id,
      },
    });

    // Vehicle owner gets vehicle read permissions
    await prisma.rolePermission.create({
      data: {
        roleId: vehicleOwnerRole.id,
        permissionId: permissions.find(p => p.name === 'Read Vehicle')!.id,
      },
    });

    // 5. Create Users
    console.log('👤 Creating users...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@fuelquota.gov.lk',
        password: '$2b$10$hashedpassword1', // In real app, this should be properly hashed
        firstName: 'System',
        lastName: 'Administrator',
        phoneNumber: '+94711234567',
        nicNumber: '199012345678',
        userType: UserType.ADMIN_USER,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[0].id,
      },
    });

    const stationOwnerUser = await prisma.user.create({
      data: {
        email: 'owner1@ceypetco.lk',
        password: '$2b$10$hashedpassword2',
        firstName: 'Sunil',
        lastName: 'Perera',
        phoneNumber: '+94712345678',
        nicNumber: '198512345679',
        userType: UserType.FUEL_STATION_OWNER,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[1].id,
      },
    });

    const operatorUser = await prisma.user.create({
      data: {
        email: 'operator1@ceypetco.lk',
        password: '$2b$10$hashedpassword3',
        firstName: 'Kamal',
        lastName: 'Silva',
        phoneNumber: '+94713456789',
        nicNumber: '199212345680',
        userType: UserType.FUEL_STATION_OPERATOR,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[2].id,
      },
    });

    const vehicleOwnerUser1 = await prisma.user.create({
      data: {
        email: 'owner1@gmail.com',
        password: '$2b$10$hashedpassword4',
        firstName: 'Nimal',
        lastName: 'Fernando',
        phoneNumber: '+94714567890',
        nicNumber: '198812345681',
        userType: UserType.VEHICLE_OWNER,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[3].id,
      },
    });

    const vehicleOwnerUser2 = await prisma.user.create({
      data: {
        email: 'owner2@gmail.com',
        password: '$2b$10$hashedpassword5',
        firstName: 'Saman',
        lastName: 'Rajapaksa',
        phoneNumber: '+94715678901',
        nicNumber: '199512345682',
        userType: UserType.VEHICLE_OWNER,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[4].id,
      },
    });

    // 6. Create specific user types
    console.log('🏢 Creating specific user types...');
    const adminUserRecord = await prisma.adminUser.create({
      data: {
        userId: adminUser.id,
      },
    });

    const fuelStationOwner = await prisma.fuelStationOwner.create({
      data: {
        businessRegNo: 'BR001234567',
        businessName: 'Perera Fuel Station (Pvt) Ltd',
        userId: stationOwnerUser.id,
      },
    });

    const vehicleOwner1 = await prisma.vehicleOwner.create({
      data: {
        userId: vehicleOwnerUser1.id,
      },
    });

    const vehicleOwner2 = await prisma.vehicleOwner.create({
      data: {
        userId: vehicleOwnerUser2.id,
      },
    });

    // 7. Create Fuel Stations
    console.log('⛽ Creating fuel stations...');
    const fuelStation1 = await prisma.fuelStation.create({
      data: {
        stationCode: 'FS001',
        name: 'Colombo Main Fuel Station',
        phoneNumber: '+94112234567',
        licenseNumber: 'FL001234567',
        ownerId: fuelStationOwner.id,
        addressId: addresses[0].id,
      },
    });

    const fuelStation2 = await prisma.fuelStation.create({
      data: {
        stationCode: 'FS002',
        name: 'Kandy Central Fuel Station',
        phoneNumber: '+94812234567',
        licenseNumber: 'FL001234568',
        ownerId: fuelStationOwner.id,
        addressId: addresses[1].id,
      },
    });

    // 8. Create Fuel Station Operator
    console.log('👨‍💼 Creating fuel station operators...');
    const operator1 = await prisma.fuelStationOperator.create({
      data: {
        employeeId: 'EMP001',
        fuelStationId: fuelStation1.id,
        userId: operatorUser.id,
      },
    });

    // 9. Create Quota Settings
    console.log('📊 Creating quota settings...');
    const quotaSettings = [
      // Car quotas
      { vehicleType: VehicleType.CAR, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 25.0 },
      { vehicleType: VehicleType.CAR, fuelType: FuelType.PETROL_95_OCTANE, weeklyLimitLiters: 25.0 },
      { vehicleType: VehicleType.CAR, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 30.0 },
      
      // Motorcycle quotas
      { vehicleType: VehicleType.MOTORCYCLE, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 4.0 },
      { vehicleType: VehicleType.MOTORCYCLE, fuelType: FuelType.PETROL_95_OCTANE, weeklyLimitLiters: 4.0 },
      
      // Three-wheeler quotas
      { vehicleType: VehicleType.THREE_WHEELER, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 7.5 },
      { vehicleType: VehicleType.THREE_WHEELER, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 10.0 },
      
      // Van quotas
      { vehicleType: VehicleType.VAN, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 40.0 },
      { vehicleType: VehicleType.VAN, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 35.0 },
      
      // Bus quotas
      { vehicleType: VehicleType.BUS, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 150.0 },
      
      // Heavy vehicle quotas
      { vehicleType: VehicleType.HEAVY_VEHICLE, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 200.0 },
      { vehicleType: VehicleType.HEAVY_VEHICLE, fuelType: FuelType.SUPER_DIESEL, weeklyLimitLiters: 200.0 },
    ];

    for (const setting of quotaSettings) {
      await prisma.quotaSettings.create({
        data: setting,
      });
    }

    // 10. Create Vehicles
    console.log('🚗 Creating vehicles...');
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Start of current week

    const vehicle1 = await prisma.vehicle.create({
      data: {
        registrationNumber: 'CAR-1234',
        chassisNumber: 'CH001234567890123',
        engineNumber: 'EN001234567',
        make: 'Toyota',
        model: 'Prius',
        vehicleType: VehicleType.CAR,
        fuelType: FuelType.PETROL_92_OCTANE,
        qrCode: 'QR001234567890',
        qrCodeGeneratedAt: new Date(),
        weeklyQuotaLiters: 25.0,
        currentWeekUsed: 15.5,
        weekStartDate: currentWeekStart,
        ownerId: vehicleOwner1.id,
      },
    });

    const vehicle2 = await prisma.vehicle.create({
      data: {
        registrationNumber: 'BIKE-5678',
        chassisNumber: 'CH001234567890124',
        engineNumber: 'EN001234568',
        make: 'Honda',
        model: 'CB150R',
        vehicleType: VehicleType.MOTORCYCLE,
        fuelType: FuelType.PETROL_92_OCTANE,
        qrCode: 'QR001234567891',
        qrCodeGeneratedAt: new Date(),
        weeklyQuotaLiters: 4.0,
        currentWeekUsed: 2.5,
        weekStartDate: currentWeekStart,
        ownerId: vehicleOwner2.id,
      },
    });

    const vehicle3 = await prisma.vehicle.create({
      data: {
        registrationNumber: 'VAN-9012',
        chassisNumber: 'CH001234567890125',
        engineNumber: 'EN001234569',
        make: 'Nissan',
        model: 'Caravan',
        vehicleType: VehicleType.VAN,
        fuelType: FuelType.AUTO_DIESEL,
        qrCode: 'QR001234567892',
        qrCodeGeneratedAt: new Date(),
        weeklyQuotaLiters: 40.0,
        currentWeekUsed: 20.0,
        weekStartDate: currentWeekStart,
        ownerId: vehicleOwner1.id,
      },
    });    // 11. Create DMT Validations
    console.log('📋 Creating DMT validations...');
    await prisma.dMTValidation.create({
      data: {
        vehicleId: vehicle1.id,
        registrationNumber: vehicle1.registrationNumber,
        chassisNumber: vehicle1.chassisNumber,
        engineNumber: vehicle1.engineNumber,
        ownerNic: vehicleOwnerUser1.nicNumber,
        ownerName: `${vehicleOwnerUser1.firstName} ${vehicleOwnerUser1.lastName}`,
      },
    });

    await prisma.dMTValidation.create({
      data: {
        vehicleId: vehicle2.id,
        registrationNumber: vehicle2.registrationNumber,
        chassisNumber: vehicle2.chassisNumber,
        engineNumber: vehicle2.engineNumber,
        ownerNic: vehicleOwnerUser2.nicNumber,
        ownerName: `${vehicleOwnerUser2.firstName} ${vehicleOwnerUser2.lastName}`,
      },
    });

    // 12. Create Fuel Inventory
    console.log('🛢️ Creating fuel inventory...');
    const fuelTypes = [FuelType.PETROL_92_OCTANE, FuelType.PETROL_95_OCTANE, FuelType.AUTO_DIESEL, FuelType.SUPER_DIESEL];
    
    for (const station of [fuelStation1, fuelStation2]) {
      for (const fuelType of fuelTypes) {
        await prisma.fuelInventory.create({
          data: {
            fuelType,
            currentStockLiters: 10000.0,
            minimumLevelLiters: 1000.0,
            maximumLevelLiters: 50000.0,
            lastRefillDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            lastRefillLiters: 40000.0,
            fuelStationId: station.id,
          },
        });
      }
    }

    // 13. Create User Role Assignments
    console.log('🎭 Creating user role assignments...');
    await prisma.userRole_Assignment.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    await prisma.userRole_Assignment.create({
      data: {
        userId: stationOwnerUser.id,
        roleId: stationOwnerRole.id,
      },
    });

    await prisma.userRole_Assignment.create({
      data: {
        userId: operatorUser.id,
        roleId: operatorRole.id,
      },
    });

    await prisma.userRole_Assignment.create({
      data: {
        userId: vehicleOwnerUser1.id,
        roleId: vehicleOwnerRole.id,
      },
    });

    await prisma.userRole_Assignment.create({
      data: {
        userId: vehicleOwnerUser2.id,
        roleId: vehicleOwnerRole.id,
      },
    });

    // 14. Create Fuel Transactions
    console.log('⛽ Creating fuel transactions...');
    await prisma.fuelTransaction.create({
      data: {
        fuelType: FuelType.PETROL_92_OCTANE,
        quantityLiters: 10.0,
        quotaBefore: 25.0,
        quotaAfter: 15.0,
        qrCodeScanned: vehicle1.qrCode!,
        transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        vehicleId: vehicle1.id,
        fuelStationId: fuelStation1.id,
        operatorId: operator1.id,
      },
    });

    await prisma.fuelTransaction.create({
      data: {
        fuelType: FuelType.PETROL_92_OCTANE,
        quantityLiters: 2.5,
        quotaBefore: 4.0,
        quotaAfter: 1.5,
        qrCodeScanned: vehicle2.qrCode!,
        transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        vehicleId: vehicle2.id,
        fuelStationId: fuelStation1.id,
        operatorId: operator1.id,
      },
    });

    // 15. Create Sessions
    console.log('🔑 Creating sessions...');
    await prisma.session.create({
      data: {
        sessionId: 'sess_admin_12345',
        userId: adminUser.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    // 16. Create SMS Logs
    console.log('📱 Creating SMS logs...');
    await prisma.smsLog.create({
      data: {
        phoneNumber: vehicleOwnerUser1.phoneNumber,
        message: 'Your fuel quota has been updated. Current balance: 15.0L',
        messageType: 'QUOTA_UPDATE',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdef',
      },
    });

    await prisma.smsLog.create({
      data: {
        phoneNumber: vehicleOwnerUser2.phoneNumber,
        message: 'Fuel transaction completed. Quantity: 2.5L. Remaining quota: 1.5L',
        messageType: 'TRANSACTION_CONFIRMATION',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdeg',
      },
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`- Addresses: ${addresses.length}`);
    console.log(`- Roles: 4`);
    console.log(`- Permissions: ${permissions.length}`);
    console.log(`- Users: 5`);
    console.log(`- Fuel Stations: 2`);
    console.log(`- Vehicles: 3`);
    console.log(`- Quota Settings: ${quotaSettings.length}`);
    console.log(`- Fuel Transactions: 2`);
    console.log(`- SMS Logs: 2`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
