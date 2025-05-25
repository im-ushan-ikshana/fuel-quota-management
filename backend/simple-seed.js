const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clean up existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.fuelTransaction.deleteMany();
    await prisma.dMTValidation.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.fuelInventory.deleteMany();
    await prisma.fuelPrice.deleteMany();
    await prisma.fuelStationOperator.deleteMany();
    await prisma.fuelStation.deleteMany();
    await prisma.fuelStationOwner.deleteMany();
    await prisma.vehicleOwner.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.userRole_Assignment.deleteMany();
    await prisma.session.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.address.deleteMany();
    await prisma.quotaSettings.deleteMany();
    await prisma.smsLog.deleteMany();

    // 1. Create Addresses
    console.log('📍 Creating addresses...');
    const addresses = await Promise.all([
      prisma.address.create({
        data: {
          addressLine1: '123 Galle Road',
          addressLine2: 'Colombo 03',
          city: 'Colombo',
          district: 'COLOMBO',
          province: 'WESTERN'
        }
      }),
      prisma.address.create({
        data: {
          addressLine1: '456 Kandy Road',
          addressLine2: 'Peradeniya',
          city: 'Kandy',
          district: 'KANDY',
          province: 'CENTRAL'
        }
      }),
      prisma.address.create({
        data: {
          addressLine1: '789 Gampaha Street',
          addressLine2: 'Negombo',
          city: 'Negombo',
          district: 'GAMPAHA',
          province: 'WESTERN'
        }
      }),
      prisma.address.create({
        data: {
          addressLine1: '321 Matara Road',
          addressLine2: 'Galle Fort',
          city: 'Galle',
          district: 'GALLE',
          province: 'SOUTHERN'
        }
      }),
      prisma.address.create({
        data: {
          addressLine1: '654 Ratnapura Highway',
          addressLine2: 'Embilipitiya',
          city: 'Ratnapura',
          district: 'RATNAPURA',
          province: 'SABARAGAMUWA'
        }
      }),
      prisma.address.create({
        data: {
          addressLine1: '987 Trincomalee Road',
          addressLine2: 'Anuradhapura New Town',
          city: 'Anuradhapura',
          district: 'ANURADHAPURA',
          province: 'NORTH_CENTRAL'
        }
      })
    ]);
    console.log(`✅ Created ${addresses.length} addresses`);

    // 2. Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'superadmin@fuelquota.lk',
          name: 'Super Administrator',
          phone: '+94771234567',
          passwordHash: hashedPassword,
          emailVerified: true,
          phoneVerified: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          email: 'admin@fuelquota.lk',
          name: 'System Administrator',
          phone: '+94772345678',
          passwordHash: hashedPassword,
          emailVerified: true,
          phoneVerified: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          email: 'stationowner@petrolshed.lk',
          name: 'John Station Owner',
          phone: '+94773456789',
          passwordHash: hashedPassword,
          emailVerified: true,
          phoneVerified: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          email: 'operator1@petrolshed.lk',
          name: 'Mike Fuel Operator',
          phone: '+94774567890',
          passwordHash: hashedPassword,
          emailVerified: true,
          phoneVerified: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          email: 'operator2@citygas.lk',
          name: 'Sarah Pump Operator',
          phone: '+94775678901',
          passwordHash: hashedPassword,
          emailVerified: true,
          phoneVerified: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          email: 'vehicleowner1@gmail.com',
          name: 'David Vehicle Owner',
          phone: '+94776789012',
          passwordHash: hashedPassword,
          emailVerified: true,
          phoneVerified: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          email: 'vehicleowner2@gmail.com',
          name: 'Lisa Car Owner',
          phone: '+94777890123',
          passwordHash: hashedPassword,
          emailVerified: true,
          phoneVerified: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          email: 'bmwowner@gmail.com',
          name: 'Robert BMW Owner',
          phone: '+94778901234',
          passwordHash: hashedPassword,
          emailVerified: true,
          phoneVerified: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ]);
    console.log(`✅ Created ${users.length} users`);

    // 3. Create Permissions
    console.log('🔐 Creating permissions...');
    const permissions = await Promise.all([
      prisma.permission.create({
        data: { name: 'USER_MANAGEMENT', description: 'Manage users, roles, and permissions' }
      }),
      prisma.permission.create({
        data: { name: 'VEHICLE_MANAGEMENT', description: 'Manage vehicle registrations and information' }
      }),
      prisma.permission.create({
        data: { name: 'FUEL_STATION_MANAGEMENT', description: 'Manage fuel stations and operators' }
      }),
      prisma.permission.create({
        data: { name: 'TRANSACTION_MANAGEMENT', description: 'View and manage fuel transactions' }
      }),
      prisma.permission.create({
        data: { name: 'QUOTA_MANAGEMENT', description: 'Manage fuel quotas and settings' }
      }),
      prisma.permission.create({
        data: { name: 'SYSTEM_ADMINISTRATION', description: 'Full system administration access' }
      }),
      prisma.permission.create({
        data: { name: 'FUEL_PUMPING', description: 'Authorize fuel pumping operations' }
      }),
      prisma.permission.create({
        data: { name: 'REPORTS_ANALYTICS', description: 'Access reports and analytics' }
      }),
      prisma.permission.create({
        data: { name: 'STATION_OPERATIONS', description: 'Manage station operations and inventory' }
      }),
      prisma.permission.create({
        data: { name: 'VEHICLE_REGISTRATION', description: 'Register and manage own vehicles' }
      })
    ]);
    console.log(`✅ Created ${permissions.length} permissions`);

    // 4. Create Roles
    console.log('👔 Creating roles...');
    const roles = await Promise.all([
      prisma.role.create({
        data: { name: 'SUPER_ADMIN', description: 'Super Administrator with full system access' }
      }),
      prisma.role.create({
        data: { name: 'ADMIN', description: 'System Administrator' }
      }),
      prisma.role.create({
        data: { name: 'STATION_OWNER', description: 'Fuel Station Owner' }
      }),
      prisma.role.create({
        data: { name: 'FUEL_OPERATOR', description: 'Fuel Station Operator' }
      }),
      prisma.role.create({
        data: { name: 'VEHICLE_OWNER', description: 'Vehicle Owner' }
      })
    ]);
    console.log(`✅ Created ${roles.length} roles`);

    // 5. Create Role-Permission Assignments
    console.log('🔗 Creating role-permission assignments...');
    const rolePermissions = [];
    
    // Super Admin gets all permissions
    for (const permission of permissions) {
      rolePermissions.push(prisma.rolePermission.create({
        data: {
          roleId: roles[0].id, // SUPER_ADMIN
          permissionId: permission.id
        }
      }));
    }

    // Admin gets most permissions except SYSTEM_ADMINISTRATION
    const adminPermissions = permissions.filter(p => p.name !== 'SYSTEM_ADMINISTRATION');
    for (const permission of adminPermissions) {
      rolePermissions.push(prisma.rolePermission.create({
        data: {
          roleId: roles[1].id, // ADMIN
          permissionId: permission.id
        }
      }));
    }

    // Station Owner permissions
    const stationOwnerPerms = permissions.filter(p => 
      ['FUEL_STATION_MANAGEMENT', 'TRANSACTION_MANAGEMENT', 'STATION_OPERATIONS', 'REPORTS_ANALYTICS'].includes(p.name)
    );
    for (const permission of stationOwnerPerms) {
      rolePermissions.push(prisma.rolePermission.create({
        data: {
          roleId: roles[2].id, // STATION_OWNER
          permissionId: permission.id
        }
      }));
    }

    // Fuel Operator permissions
    const operatorPerms = permissions.filter(p => 
      ['FUEL_PUMPING', 'TRANSACTION_MANAGEMENT', 'STATION_OPERATIONS'].includes(p.name)
    );
    for (const permission of operatorPerms) {
      rolePermissions.push(prisma.rolePermission.create({
        data: {
          roleId: roles[3].id, // FUEL_OPERATOR
          permissionId: permission.id
        }
      }));
    }

    // Vehicle Owner permissions
    const vehicleOwnerPerms = permissions.filter(p => 
      ['VEHICLE_REGISTRATION'].includes(p.name)
    );
    for (const permission of vehicleOwnerPerms) {
      rolePermissions.push(prisma.rolePermission.create({
        data: {
          roleId: roles[4].id, // VEHICLE_OWNER
          permissionId: permission.id
        }
      }));
    }

    await Promise.all(rolePermissions);
    console.log(`✅ Created ${rolePermissions.length} role-permission assignments`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${addresses.length} addresses`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${permissions.length} permissions`);
    console.log(`   - ${roles.length} roles`);
    console.log(`   - ${rolePermissions.length} role-permission assignments`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('💥 Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
