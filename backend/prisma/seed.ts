import { PrismaClient } from '@prisma/client';
import { 
  VehicleType, 
  FuelType, 
  UserType, 
  Province, 
  District 
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clean existing data (in reverse dependency order)
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
      prisma.address.create({
        data: {
          addressLine1: '987 Kurunegala Road',
          city: 'Kurunegala',
          district: District.KURUNEGALA,
          province: Province.NORTH_WESTERN,
        },
      }),
      prisma.address.create({
        data: {
          addressLine1: '543 Anuradhapura Road',
          city: 'Anuradhapura',
          district: District.ANURADHAPURA,
          province: Province.NORTH_CENTRAL,
        },
      }),
      prisma.address.create({
        data: {
          addressLine1: '876 Badulla Road',
          city: 'Badulla',
          district: District.BADULLA,
          province: Province.UVA,
        },
      }),
      prisma.address.create({
        data: {
          addressLine1: '234 Ratnapura Road',
          city: 'Ratnapura',
          district: District.RATNAPURA,
          province: Province.SABARAGAMUWA,
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
      prisma.permission.create({
        data: {
          name: 'Delete Vehicle',
          module: 'VEHICLE',
          action: 'DELETE',
          description: 'Delete vehicle information',
        },
      }),
      // Fuel station permissions
      prisma.permission.create({
        data: {
          name: 'Create Fuel Station',
          module: 'FUEL_STATION',
          action: 'CREATE',
          description: 'Create new fuel stations',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Read Fuel Station',
          module: 'FUEL_STATION',
          action: 'READ',
          description: 'View fuel station information',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Update Fuel Station',
          module: 'FUEL_STATION',
          action: 'UPDATE',
          description: 'Update fuel station information',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Delete Fuel Station',
          module: 'FUEL_STATION',
          action: 'DELETE',
          description: 'Delete fuel stations',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Manage Fuel Station',
          module: 'FUEL_STATION',
          action: 'MANAGE',
          description: 'Manage fuel station operations',
        },
      }),
      // Transaction permissions
      prisma.permission.create({
        data: {
          name: 'Process Transaction',
          module: 'TRANSACTION',
          action: 'CREATE',
          description: 'Process fuel transactions',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'View Transactions',
          module: 'TRANSACTION',
          action: 'READ',
          description: 'View transaction history',
        },
      }),
      // Inventory permissions
      prisma.permission.create({
        data: {
          name: 'Manage Inventory',
          module: 'INVENTORY',
          action: 'MANAGE',
          description: 'Manage fuel inventory',
        },
      }),
      // Quota permissions
      prisma.permission.create({
        data: {
          name: 'Manage Quotas',
          module: 'QUOTA',
          action: 'MANAGE',
          description: 'Manage fuel quotas',
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

    // Station owner gets station, inventory, and some transaction permissions
    const stationOwnerPermissions = [
      'Manage Fuel Station', 'Read Fuel Station', 'Update Fuel Station',
      'Manage Inventory', 'View Transactions'
    ];
    
    for (const permName of stationOwnerPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: stationOwnerRole.id,
          permissionId: permissions.find(p => p.name === permName)!.id,
        },
      });
    }

    // Operator gets transaction permissions
    const operatorPermissions = [
      'Process Transaction', 'View Transactions', 'Read Vehicle'
    ];
    
    for (const permName of operatorPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: operatorRole.id,
          permissionId: permissions.find(p => p.name === permName)!.id,
        },
      });
    }

    // Vehicle owner gets vehicle read permissions
    const vehicleOwnerPermissions = [
      'Read Vehicle', 'View Transactions'
    ];
    
    for (const permName of vehicleOwnerPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: vehicleOwnerRole.id,
          permissionId: permissions.find(p => p.name === permName)!.id,
        },
      });
    }

    // 5. Create Users
    console.log('👤 Creating users...');
    // Create a hashed password for demo users
    const hashedPassword = await bcrypt.hash('Password@123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@fuelquota.gov.lk',
        password: hashedPassword,
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

    const stationOwnerUser1 = await prisma.user.create({
      data: {
        email: 'owner1@ceypetco.lk',
        password: hashedPassword,
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
    
    const stationOwnerUser2 = await prisma.user.create({
      data: {
        email: 'owner2@ioc.lk',
        password: hashedPassword,
        firstName: 'Anil',
        lastName: 'Jayawardena',
        phoneNumber: '+94723456789',
        nicNumber: '198712345680',
        userType: UserType.FUEL_STATION_OWNER,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[2].id,
      },
    });

    const operatorUser1 = await prisma.user.create({
      data: {
        email: 'operator1@ceypetco.lk',
        password: hashedPassword,
        firstName: 'Kamal',
        lastName: 'Silva',
        phoneNumber: '+94713456789',
        nicNumber: '199212345681',
        userType: UserType.FUEL_STATION_OPERATOR,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[3].id,
      },
    });
    
    const operatorUser2 = await prisma.user.create({
      data: {
        email: 'operator2@ceypetco.lk',
        password: hashedPassword,
        firstName: 'Nalin',
        lastName: 'Bandara',
        phoneNumber: '+94714567890',
        nicNumber: '199312345682',
        userType: UserType.FUEL_STATION_OPERATOR,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[4].id,
      },
    });
    
    const operatorUser3 = await prisma.user.create({
      data: {
        email: 'operator3@ioc.lk',
        password: hashedPassword,
        firstName: 'Priya',
        lastName: 'Mendis',
        phoneNumber: '+94715678901',
        nicNumber: '199412345683',
        userType: UserType.FUEL_STATION_OPERATOR,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[5].id,
      },
    });

    const vehicleOwnerUser1 = await prisma.user.create({
      data: {
        email: 'vehicle1@gmail.com',
        password: hashedPassword,
        firstName: 'Nimal',
        lastName: 'Fernando',
        phoneNumber: '+94716789012',
        nicNumber: '198812345684',
        userType: UserType.VEHICLE_OWNER,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[6].id,
      },
    });

    const vehicleOwnerUser2 = await prisma.user.create({
      data: {
        email: 'vehicle2@gmail.com',
        password: hashedPassword,
        firstName: 'Saman',
        lastName: 'Rajapaksa',
        phoneNumber: '+94717890123',
        nicNumber: '199512345685',
        userType: UserType.VEHICLE_OWNER,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[7].id,
      },
    });
    
    const vehicleOwnerUser3 = await prisma.user.create({
      data: {
        email: 'vehicle3@gmail.com',
        password: hashedPassword,
        firstName: 'Kumari',
        lastName: 'Perera',
        phoneNumber: '+94718901234',
        nicNumber: '199012345686',
        userType: UserType.VEHICLE_OWNER,
        emailVerified: true,
        phoneVerified: true,
        addressId: addresses[8].id,
      },
    });

    // 6. Create specific user types
    console.log('🏢 Creating specific user types...');
    const adminUserRecord = await prisma.adminUser.create({
      data: {
        userId: adminUser.id,
      },
    });

    const fuelStationOwner1 = await prisma.fuelStationOwner.create({
      data: {
        businessRegNo: 'BR001234567',
        businessName: 'Perera Fuel Stations (Pvt) Ltd',
        userId: stationOwnerUser1.id,
      },
    });
    
    const fuelStationOwner2 = await prisma.fuelStationOwner.create({
      data: {
        businessRegNo: 'BR002345678',
        businessName: 'Jayawardena Fuel Distribution (Pvt) Ltd',
        userId: stationOwnerUser2.id,
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
    
    const vehicleOwner3 = await prisma.vehicleOwner.create({
      data: {
        userId: vehicleOwnerUser3.id,
      },
    });

    // 7. Create Fuel Stations
    console.log('⛽ Creating fuel stations...');
    const fuelStation1 = await prisma.fuelStation.create({
      data: {
        stationCode: 'CPC001',
        name: 'Colombo Main Fuel Station',
        phoneNumber: '+94112234567',
        licenseNumber: 'FL001234567',
        ownerId: fuelStationOwner1.id,
        addressId: addresses[0].id,
      },
    });

    const fuelStation2 = await prisma.fuelStation.create({
      data: {
        stationCode: 'CPC002',
        name: 'Kandy Central Fuel Station',
        phoneNumber: '+94812234567',
        licenseNumber: 'FL001234568',
        ownerId: fuelStationOwner1.id,
        addressId: addresses[1].id,
      },
    });
    
    const fuelStation3 = await prisma.fuelStation.create({
      data: {
        stationCode: 'IOC001',
        name: 'Matara IOC Fuel Station',
        phoneNumber: '+94412234567',
        licenseNumber: 'FL001234569',
        ownerId: fuelStationOwner2.id,
        addressId: addresses[2].id,
      },
    });
    
    const fuelStation4 = await prisma.fuelStation.create({
      data: {
        stationCode: 'IOC002',
        name: 'Jaffna IOC Fuel Station',
        phoneNumber: '+94212234567',
        licenseNumber: 'FL001234570',
        ownerId: fuelStationOwner2.id,
        addressId: addresses[3].id,
      },
    });
    
    const fuelStation5 = await prisma.fuelStation.create({
      data: {
        stationCode: 'CPC003',
        name: 'Batticaloa Fuel Station',
        phoneNumber: '+94652234567',
        licenseNumber: 'FL001234571',
        ownerId: fuelStationOwner1.id,
        addressId: addresses[4].id,
      },
    });

    // 8. Create Fuel Station Operators
    console.log('👨‍💼 Creating fuel station operators...');
    const operator1 = await prisma.fuelStationOperator.create({
      data: {
        employeeId: 'EMP001',
        fuelStationId: fuelStation1.id,
        userId: operatorUser1.id,
      },
    });
    
    const operator2 = await prisma.fuelStationOperator.create({
      data: {
        employeeId: 'EMP002',
        fuelStationId: fuelStation2.id,
        userId: operatorUser2.id,
      },
    });
    
    const operator3 = await prisma.fuelStationOperator.create({
      data: {
        employeeId: 'EMP003',
        fuelStationId: fuelStation3.id,
        userId: operatorUser3.id,
      },
    });

    // 9. Create Quota Settings
    console.log('📊 Creating quota settings...');
    const quotaSettings = [
      // Car quotas
      { vehicleType: VehicleType.CAR, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 20.0 },
      { vehicleType: VehicleType.CAR, fuelType: FuelType.PETROL_95_OCTANE, weeklyLimitLiters: 20.0 },
      { vehicleType: VehicleType.CAR, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 25.0 },
      { vehicleType: VehicleType.CAR, fuelType: FuelType.SUPER_DIESEL, weeklyLimitLiters: 25.0 },
      
      // Motorcycle quotas
      { vehicleType: VehicleType.MOTORCYCLE, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 5.0 },
      { vehicleType: VehicleType.MOTORCYCLE, fuelType: FuelType.PETROL_95_OCTANE, weeklyLimitLiters: 5.0 },
      
      // Scooter quotas
      { vehicleType: VehicleType.SCOOTER, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 3.0 },
      { vehicleType: VehicleType.SCOOTER, fuelType: FuelType.PETROL_95_OCTANE, weeklyLimitLiters: 3.0 },
      
      // Three-wheeler quotas
      { vehicleType: VehicleType.THREE_WHEELER, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 7.0 },
      { vehicleType: VehicleType.THREE_WHEELER, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 8.0 },
      
      // Van quotas
      { vehicleType: VehicleType.VAN, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 35.0 },
      { vehicleType: VehicleType.VAN, fuelType: FuelType.SUPER_DIESEL, weeklyLimitLiters: 35.0 },
      { vehicleType: VehicleType.VAN, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 30.0 },
      { vehicleType: VehicleType.VAN, fuelType: FuelType.PETROL_95_OCTANE, weeklyLimitLiters: 30.0 },
      
      // Lorry quotas
      { vehicleType: VehicleType.LORRY, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 80.0 },
      { vehicleType: VehicleType.LORRY, fuelType: FuelType.SUPER_DIESEL, weeklyLimitLiters: 80.0 },
      
      // Bus quotas
      { vehicleType: VehicleType.BUS, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 150.0 },
      { vehicleType: VehicleType.BUS, fuelType: FuelType.SUPER_DIESEL, weeklyLimitLiters: 150.0 },
      
      // Heavy vehicle quotas
      { vehicleType: VehicleType.HEAVY_VEHICLE, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 200.0 },
      { vehicleType: VehicleType.HEAVY_VEHICLE, fuelType: FuelType.SUPER_DIESEL, weeklyLimitLiters: 200.0 },
      
      // Special purpose vehicle quotas
      { vehicleType: VehicleType.SPECIAL_PURPOSE_VEHICLE, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 100.0 },
      { vehicleType: VehicleType.SPECIAL_PURPOSE_VEHICLE, fuelType: FuelType.SUPER_DIESEL, weeklyLimitLiters: 100.0 },
      { vehicleType: VehicleType.SPECIAL_PURPOSE_VEHICLE, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 80.0 },
      
      // Boat quotas
      { vehicleType: VehicleType.BOAT, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 120.0 },
      { vehicleType: VehicleType.BOAT, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 100.0 },
      
      // Other quotas
      { vehicleType: VehicleType.OTHER, fuelType: FuelType.AUTO_DIESEL, weeklyLimitLiters: 30.0 },
      { vehicleType: VehicleType.OTHER, fuelType: FuelType.PETROL_92_OCTANE, weeklyLimitLiters: 25.0 },
      { vehicleType: VehicleType.OTHER, fuelType: FuelType.KEROSENE, weeklyLimitLiters: 15.0 },
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
        weeklyQuotaLiters: 20.0,
        currentWeekUsed: 12.5,
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
        weeklyQuotaLiters: 5.0,
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
        weeklyQuotaLiters: 35.0,
        currentWeekUsed: 15.0,
        weekStartDate: currentWeekStart,
        ownerId: vehicleOwner1.id,
      },
    });
    
    const vehicle4 = await prisma.vehicle.create({
      data: {
        registrationNumber: 'CAR-5678',
        chassisNumber: 'CH001234567890126',
        engineNumber: 'EN001234570',
        make: 'Honda',
        model: 'Civic',
        vehicleType: VehicleType.CAR,
        fuelType: FuelType.PETROL_95_OCTANE,
        qrCode: 'QR001234567893',
        qrCodeGeneratedAt: new Date(),
        weeklyQuotaLiters: 20.0,
        currentWeekUsed: 8.0,
        weekStartDate: currentWeekStart,
        ownerId: vehicleOwner3.id,
      },
    });
    
    const vehicle5 = await prisma.vehicle.create({
      data: {
        registrationNumber: 'THREE-1234',
        chassisNumber: 'CH001234567890127',
        engineNumber: 'EN001234571',
        make: 'Bajaj',
        model: 'RE',
        vehicleType: VehicleType.THREE_WHEELER,
        fuelType: FuelType.PETROL_92_OCTANE,
        qrCode: 'QR001234567894',
        qrCodeGeneratedAt: new Date(),
        weeklyQuotaLiters: 7.0,
        currentWeekUsed: 4.0,
        weekStartDate: currentWeekStart,
        ownerId: vehicleOwner2.id,
      },
    });
    
    const vehicle6 = await prisma.vehicle.create({
      data: {
        registrationNumber: 'BUS-5678',
        chassisNumber: 'CH001234567890128',
        engineNumber: 'EN001234572',
        make: 'Ashok Leyland',
        model: 'Viking',
        vehicleType: VehicleType.BUS,
        fuelType: FuelType.AUTO_DIESEL,
        qrCode: 'QR001234567895',
        qrCodeGeneratedAt: new Date(),
        weeklyQuotaLiters: 150.0,
        currentWeekUsed: 75.0,
        weekStartDate: currentWeekStart,
        ownerId: vehicleOwner3.id,
      },
    });

    // 11. Create DMT Validations (both linked and unlinked)
    console.log('📋 Creating DMT validations...');
    // Create DMT validations that will be linked to vehicles
    const dmtValidation1 = await prisma.dMTValidation.create({
      data: {
        registrationNumber: vehicle1.registrationNumber,
        chassisNumber: vehicle1.chassisNumber,
        engineNumber: vehicle1.engineNumber,
        ownerNic: vehicleOwnerUser1.nicNumber,
        ownerName: `${vehicleOwnerUser1.firstName} ${vehicleOwnerUser1.lastName}`,
      },
    });

    const dmtValidation2 = await prisma.dMTValidation.create({
      data: {
        registrationNumber: vehicle2.registrationNumber,
        chassisNumber: vehicle2.chassisNumber,
        engineNumber: vehicle2.engineNumber,
        ownerNic: vehicleOwnerUser2.nicNumber,
        ownerName: `${vehicleOwnerUser2.firstName} ${vehicleOwnerUser2.lastName}`,
      },
    });
    
    const dmtValidation3 = await prisma.dMTValidation.create({
      data: {
        registrationNumber: vehicle3.registrationNumber,
        chassisNumber: vehicle3.chassisNumber,
        engineNumber: vehicle3.engineNumber,
        ownerNic: vehicleOwnerUser1.nicNumber,
        ownerName: `${vehicleOwnerUser1.firstName} ${vehicleOwnerUser1.lastName}`,
      },
    });
    
    const dmtValidation4 = await prisma.dMTValidation.create({
      data: {
        registrationNumber: vehicle4.registrationNumber,
        chassisNumber: vehicle4.chassisNumber,
        engineNumber: vehicle4.engineNumber,
        ownerNic: vehicleOwnerUser3.nicNumber,
        ownerName: `${vehicleOwnerUser3.firstName} ${vehicleOwnerUser3.lastName}`,
      },
    });

    // Create additional DMT validations that are NOT linked to vehicles (pending registrations)
    console.log('📋 Creating additional unlinked DMT validations...');
    await prisma.dMTValidation.create({
      data: {
        registrationNumber: 'CAR-9876',
        chassisNumber: 'CH987654321098765',
        engineNumber: 'EN987654321',
        ownerNic: '199009876543',
        ownerName: 'Priyanka Wickramasinghe',
      },
    });

    await prisma.dMTValidation.create({
      data: {
        registrationNumber: 'BIKE-9999',
        chassisNumber: 'CH123456789012346',
        engineNumber: 'EN123456790',
        ownerNic: '198765432109',
        ownerName: 'Chaminda Silva',
      },
    });

    await prisma.dMTValidation.create({
      data: {
        registrationNumber: 'VAN-7777',
        chassisNumber: 'CH555666777888999',
        engineNumber: 'EN555666777',
        ownerNic: '199876543210',
        ownerName: 'Ruwan Jayawardena',
      },
    });

    await prisma.dMTValidation.create({
      data: {
        registrationNumber: 'THREE-3333',
        chassisNumber: 'CH333444555666777',
        engineNumber: 'EN333444555',
        ownerNic: '199512309876',
        ownerName: 'Anjali Perera',
      },
    });

    await prisma.dMTValidation.create({
      data: {
        registrationNumber: 'BUS-8888',
        chassisNumber: 'CH888999000111222',
        engineNumber: 'EN888999000',
        ownerNic: '198012345679',
        ownerName: 'Kumarasinghe Transport (Pvt) Ltd',
      },
    });

    // Create additional DMT validations for different vehicle types
    await prisma.dMTValidation.create({
      data: {
        registrationNumber: 'TRUCK-4567',
        chassisNumber: 'CH444555666777888',
        engineNumber: 'EN444555666',
        ownerNic: '199203456789',
        ownerName: 'Sampath Transport Services',
      },
    });

    await prisma.dMTValidation.create({
      data: {
        registrationNumber: 'JEEP-1122',
        chassisNumber: 'CH111222333444555',
        engineNumber: 'EN111222333',
        ownerNic: '198812345678',
        ownerName: 'Nimal Fernando',
      },
    });

    await prisma.dMTValidation.create({
      data: {
        registrationNumber: 'LORRY-9876',
        chassisNumber: 'CH987654321012345',
        engineNumber: 'EN987654321',
        ownerNic: '199567890123',
        ownerName: 'Heavy Transport (Pvt) Ltd',
      },
    });

    // Link the DMT validations to their respective vehicles
    console.log('🔗 Linking DMT validations to vehicles...');
    await prisma.vehicle.update({
      where: { id: vehicle1.id },
      data: { dmtValidationId: dmtValidation1.id },
    });

    await prisma.vehicle.update({
      where: { id: vehicle2.id },
      data: { dmtValidationId: dmtValidation2.id },
    });
    
    await prisma.vehicle.update({
      where: { id: vehicle3.id },
      data: { dmtValidationId: dmtValidation3.id },
    });
    
    await prisma.vehicle.update({
      where: { id: vehicle4.id },
      data: { dmtValidationId: dmtValidation4.id },
    });

    // 12. Create Fuel Inventory
    console.log('🛢️ Creating fuel inventory...');
    const fuelTypes = [
      FuelType.PETROL_92_OCTANE, 
      FuelType.PETROL_95_OCTANE, 
      FuelType.AUTO_DIESEL, 
      FuelType.SUPER_DIESEL,
      FuelType.KEROSENE
    ];
    
    for (const station of [fuelStation1, fuelStation2, fuelStation3, fuelStation4, fuelStation5]) {
      for (const fuelType of fuelTypes) {
        await prisma.fuelInventory.create({
          data: {
            fuelType,
            currentStockLiters: Math.floor(Math.random() * 20000) + 5000, // Random stock between 5000-25000 liters
            minimumLevelLiters: 1000.0,
            maximumLevelLiters: 50000.0,
            lastRefillDate: new Date(Date.now() - (Math.floor(Math.random() * 14) + 1) * 24 * 60 * 60 * 1000), // Random date within last 2 weeks
            lastRefillLiters: Math.floor(Math.random() * 30000) + 10000, // Random refill between 10000-40000 liters
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
        userId: stationOwnerUser1.id,
        roleId: stationOwnerRole.id,
      },
    });
    
    await prisma.userRole_Assignment.create({
      data: {
        userId: stationOwnerUser2.id,
        roleId: stationOwnerRole.id,
      },
    });

    await prisma.userRole_Assignment.create({
      data: {
        userId: operatorUser1.id,
        roleId: operatorRole.id,
      },
    });
    
    await prisma.userRole_Assignment.create({
      data: {
        userId: operatorUser2.id,
        roleId: operatorRole.id,
      },
    });
    
    await prisma.userRole_Assignment.create({
      data: {
        userId: operatorUser3.id,
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
    
    await prisma.userRole_Assignment.create({
      data: {
        userId: vehicleOwnerUser3.id,
        roleId: vehicleOwnerRole.id,
      },
    });

    // 14. Create Fuel Transactions
    console.log('⛽ Creating fuel transactions...');
    // Transaction dates over the past week
    const pastDates = [];
    for (let i = 1; i <= 7; i++) {
      pastDates.push(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    }
    
    // Create multiple transactions for each vehicle
    const transactions = [
      // Vehicle 1 transactions
      {
        fuelType: FuelType.PETROL_92_OCTANE,
        quantityLiters: 8.0,
        quotaBefore: 20.0,
        quotaAfter: 12.0,
        qrCodeScanned: vehicle1.qrCode!,
        transactionDate: pastDates[0], // Yesterday
        vehicleId: vehicle1.id,
        fuelStationId: fuelStation1.id,
        operatorId: operator1.id,
      },
      {
        fuelType: FuelType.PETROL_92_OCTANE,
        quantityLiters: 4.5,
        quotaBefore: 12.0,
        quotaAfter: 7.5,
        qrCodeScanned: vehicle1.qrCode!,
        transactionDate: pastDates[3], // 4 days ago
        vehicleId: vehicle1.id,
        fuelStationId: fuelStation1.id,
        operatorId: operator1.id,
      },
      
      // Vehicle 2 transactions
      {
        fuelType: FuelType.PETROL_92_OCTANE,
        quantityLiters: 2.5,
        quotaBefore: 5.0,
        quotaAfter: 2.5,
        qrCodeScanned: vehicle2.qrCode!,
        transactionDate: pastDates[1], // 2 days ago
        vehicleId: vehicle2.id,
        fuelStationId: fuelStation2.id,
        operatorId: operator2.id,
      },
      
      // Vehicle 3 transactions
      {
        fuelType: FuelType.AUTO_DIESEL,
        quantityLiters: 15.0,
        quotaBefore: 35.0,
        quotaAfter: 20.0,
        qrCodeScanned: vehicle3.qrCode!,
        transactionDate: pastDates[2], // 3 days ago
        vehicleId: vehicle3.id,
        fuelStationId: fuelStation1.id,
        operatorId: operator1.id,
      },
      {
        fuelType: FuelType.AUTO_DIESEL,
        quantityLiters: 5.0,
        quotaBefore: 20.0,
        quotaAfter: 15.0,
        qrCodeScanned: vehicle3.qrCode!,
        transactionDate: pastDates[6], // 7 days ago
        vehicleId: vehicle3.id,
        fuelStationId: fuelStation3.id,
        operatorId: operator3.id,
      },
      
      // Vehicle 4 transactions
      {
        fuelType: FuelType.PETROL_95_OCTANE,
        quantityLiters: 8.0,
        quotaBefore: 20.0,
        quotaAfter: 12.0,
        qrCodeScanned: vehicle4.qrCode!,
        transactionDate: pastDates[1], // 2 days ago
        vehicleId: vehicle4.id,
        fuelStationId: fuelStation3.id,
        operatorId: operator3.id,
      },
      
      // Vehicle 5 transactions
      {
        fuelType: FuelType.PETROL_92_OCTANE,
        quantityLiters: 4.0,
        quotaBefore: 7.0,
        quotaAfter: 3.0,
        qrCodeScanned: vehicle5.qrCode!,
        transactionDate: pastDates[4], // 5 days ago
        vehicleId: vehicle5.id,
        fuelStationId: fuelStation2.id,
        operatorId: operator2.id,
      },
      
      // Vehicle 6 transactions
      {
        fuelType: FuelType.AUTO_DIESEL,
        quantityLiters: 50.0,
        quotaBefore: 150.0,
        quotaAfter: 100.0,
        qrCodeScanned: vehicle6.qrCode!,
        transactionDate: pastDates[2], // 3 days ago
        vehicleId: vehicle6.id,
        fuelStationId: fuelStation4.id,
        operatorId: operator3.id,
      },
      {
        fuelType: FuelType.AUTO_DIESEL,
        quantityLiters: 25.0,
        quotaBefore: 100.0,
        quotaAfter: 75.0,
        qrCodeScanned: vehicle6.qrCode!,
        transactionDate: pastDates[5], // 6 days ago
        vehicleId: vehicle6.id,
        fuelStationId: fuelStation3.id,
        operatorId: operator3.id,
      },
    ];
    
    for (const transaction of transactions) {
      await prisma.fuelTransaction.create({
        data: transaction,
      });
    }

    // 15. Create Sessions
    console.log('🔑 Creating sessions...');
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    await prisma.session.create({
      data: {
        sessionId: 'sess_admin_12345',
        userId: adminUser.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        expiresAt: expiryTime,
      },
    });
    
    await prisma.session.create({
      data: {
        sessionId: 'sess_owner1_12345',
        userId: stationOwnerUser1.id,
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0',
        expiresAt: expiryTime,
      },
    });
    
    await prisma.session.create({
      data: {
        sessionId: 'sess_operator1_12345',
        userId: operatorUser1.id,
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15',
        expiresAt: expiryTime,
      },
    });
    
    await prisma.session.create({
      data: {
        sessionId: 'sess_vehicle1_12345',
        userId: vehicleOwnerUser1.id,
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/114.0.5735.196',
        expiresAt: expiryTime,
      },
    });

    // 16. Create SMS Logs
    console.log('📱 Creating SMS logs...');
    const smsLogs = [
      {
        phoneNumber: vehicleOwnerUser1.phoneNumber,
        message: 'Your fuel quota has been updated. Current balance: 7.5L',
        messageType: 'QUOTA_UPDATE',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdef',
        sentAt: pastDates[3],
      },
      {
        phoneNumber: vehicleOwnerUser2.phoneNumber,
        message: 'Fuel transaction completed. Quantity: 2.5L. Remaining quota: 2.5L',
        messageType: 'TRANSACTION_CONFIRMATION',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdeg',
        sentAt: pastDates[1],
      },
      {
        phoneNumber: vehicleOwnerUser3.phoneNumber,
        message: 'Fuel transaction completed. Quantity: 8.0L. Remaining quota: 12.0L',
        messageType: 'TRANSACTION_CONFIRMATION',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdeh',
        sentAt: pastDates[1],
      },
      {
        phoneNumber: vehicleOwnerUser1.phoneNumber,
        message: 'Fuel transaction completed. Quantity: 8.0L. Remaining quota: 12.0L',
        messageType: 'TRANSACTION_CONFIRMATION',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdei',
        sentAt: pastDates[0],
      },
      {
        phoneNumber: vehicleOwnerUser1.phoneNumber,
        message: 'Fuel transaction completed. Quantity: 15.0L. Remaining quota: 20.0L',
        messageType: 'TRANSACTION_CONFIRMATION',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdej',
        sentAt: pastDates[2],
      },
      {
        phoneNumber: vehicleOwnerUser3.phoneNumber,
        message: 'Your weekly fuel quota has been reset. New balance: 150.0L',
        messageType: 'QUOTA_RESET',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdek',
        sentAt: new Date(currentWeekStart.getTime()),
      },
      {
        phoneNumber: '+94718888888',
        message: 'Your vehicle registration request is pending. Please visit the nearest DMT office.',
        messageType: 'REGISTRATION_NOTIFICATION',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdel',
        sentAt: pastDates[5],
      },
      {
        phoneNumber: vehicleOwnerUser2.phoneNumber,
        message: 'Your fuel transaction at Kandy Central Fuel Station failed. Please try again.',
        messageType: 'TRANSACTION_ERROR',
        status: 'SENT',
        twilioSid: 'SM1234567890abcdem',
        sentAt: pastDates[4],
      },
    ];
    
    for (const log of smsLogs) {
      await prisma.smsLog.create({
        data: log,
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`- Addresses: ${addresses.length}`);
    console.log(`- Roles: 4`);
    console.log(`- Permissions: ${permissions.length}`);
    console.log(`- Users: ${3 + 2 + 3 + 3}`); // Admin + Station owners + Operators + Vehicle owners
    console.log(`- Fuel Stations: 5`);
    console.log(`- Fuel Station Operators: 3`);
    console.log(`- Vehicles: 6`);
    console.log(`- DMT Validations: ${4 + 8}`); // Linked + Unlinked
    console.log(`- Quota Settings: ${quotaSettings.length}`);
    console.log(`- Fuel Inventory: ${5 * fuelTypes.length}`); // 5 stations × 5 fuel types
    console.log(`- Fuel Transactions: ${transactions.length}`);
    console.log(`- User Role Assignments: 9`);
    console.log(`- Sessions: 4`);
    console.log(`- SMS Logs: ${smsLogs.length}`);

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
