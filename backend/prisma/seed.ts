import { 
  PrismaClient, 
  UserType, 
  VehicleType, 
  FuelType, 
  Province, 
  District,
  TransactionStatus 
} from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 1) Create Roles
  console.log('Creating roles...')
  const [adminRole, vehicleOwnerRole, stationOwnerRole, operatorRole] = await Promise.all([
    prisma.role.create({ 
      data: { 
        name: 'ADMIN', 
        description: 'System Administrator with full access' 
      } 
    }),
    prisma.role.create({ 
      data: { 
        name: 'VEHICLE_OWNER', 
        description: 'Vehicle Owner with access to vehicle management' 
      } 
    }),
    prisma.role.create({ 
      data: { 
        name: 'STATION_OWNER', 
        description: 'Fuel Station Owner with station management access' 
      } 
    }),
    prisma.role.create({ 
      data: { 
        name: 'STATION_OPERATOR', 
        description: 'Fuel Station Operator with transaction access' 
      } 
    }),
  ])

  // 2) Create Permissions
  console.log('Creating permissions...')
  const permissions = await Promise.all([
    prisma.permission.create({ data: { name: 'MANAGE_USERS', module: 'User', action: 'MANAGE', description: 'Manage all users' } }),
    prisma.permission.create({ data: { name: 'VIEW_USERS', module: 'User', action: 'VIEW', description: 'View users' } }),
    prisma.permission.create({ data: { name: 'MANAGE_VEHICLES', module: 'Vehicle', action: 'MANAGE', description: 'Manage vehicles' } }),
    prisma.permission.create({ data: { name: 'VIEW_VEHICLES', module: 'Vehicle', action: 'VIEW', description: 'View vehicles' } }),
    prisma.permission.create({ data: { name: 'MANAGE_STATIONS', module: 'Station', action: 'MANAGE', description: 'Manage fuel stations' } }),
    prisma.permission.create({ data: { name: 'VIEW_STATIONS', module: 'Station', action: 'VIEW', description: 'View fuel stations' } }),
    prisma.permission.create({ data: { name: 'PROCESS_TRANSACTIONS', module: 'Transaction', action: 'CREATE', description: 'Process fuel transactions' } }),
    prisma.permission.create({ data: { name: 'VIEW_TRANSACTIONS', module: 'Transaction', action: 'VIEW', description: 'View transactions' } }),
    prisma.permission.create({ data: { name: 'MANAGE_INVENTORY', module: 'Inventory', action: 'MANAGE', description: 'Manage fuel inventory' } }),
    prisma.permission.create({ data: { name: 'VIEW_REPORTS', module: 'Reports', action: 'VIEW', description: 'View system reports' } }),
  ])

  // 3) Assign permissions to roles
  console.log('Assigning permissions to roles...')
  await Promise.all([
    // ADMIN gets all permissions
    ...permissions.map(p => 
      prisma.rolePermission.create({ 
        data: { roleId: adminRole.id, permissionId: p.id } 
      })
    ),
    // VEHICLE_OWNER permissions
    prisma.rolePermission.create({ data: { roleId: vehicleOwnerRole.id, permissionId: permissions.find(p => p.name === 'VIEW_VEHICLES')!.id } }),
    prisma.rolePermission.create({ data: { roleId: vehicleOwnerRole.id, permissionId: permissions.find(p => p.name === 'VIEW_TRANSACTIONS')!.id } }),
    // STATION_OWNER permissions
    prisma.rolePermission.create({ data: { roleId: stationOwnerRole.id, permissionId: permissions.find(p => p.name === 'MANAGE_STATIONS')!.id } }),
    prisma.rolePermission.create({ data: { roleId: stationOwnerRole.id, permissionId: permissions.find(p => p.name === 'VIEW_STATIONS')!.id } }),
    prisma.rolePermission.create({ data: { roleId: stationOwnerRole.id, permissionId: permissions.find(p => p.name === 'MANAGE_INVENTORY')!.id } }),
    prisma.rolePermission.create({ data: { roleId: stationOwnerRole.id, permissionId: permissions.find(p => p.name === 'VIEW_TRANSACTIONS')!.id } }),
    // STATION_OPERATOR permissions
    prisma.rolePermission.create({ data: { roleId: operatorRole.id, permissionId: permissions.find(p => p.name === 'PROCESS_TRANSACTIONS')!.id } }),
    prisma.rolePermission.create({ data: { roleId: operatorRole.id, permissionId: permissions.find(p => p.name === 'VIEW_TRANSACTIONS')!.id } }),
    prisma.rolePermission.create({ data: { roleId: operatorRole.id, permissionId: permissions.find(p => p.name === 'VIEW_VEHICLES')!.id } }),
  ])

  // 4) Create Addresses (covering all provinces and districts)
  console.log('Creating addresses...')
  const addresses = await Promise.all([
    // Western Province
    prisma.address.create({ data: { addressLine1: '123 Galle Road', city: 'Colombo', district: District.COLOMBO, province: Province.WESTERN } }),
    prisma.address.create({ data: { addressLine1: '45 Kandy Road', city: 'Gampaha', district: District.GAMPAHA, province: Province.WESTERN } }),
    prisma.address.create({ data: { addressLine1: '78 Main Street', city: 'Kalutara', district: District.KALUTARA, province: Province.WESTERN } }),
    
    // Central Province
    prisma.address.create({ data: { addressLine1: '100 Peradeniya Road', city: 'Kandy', district: District.KANDY, province: Province.CENTRAL } }),
    prisma.address.create({ data: { addressLine1: '25 Temple Street', city: 'Matale', district: District.MATALE, province: Province.CENTRAL } }),
    prisma.address.create({ data: { addressLine1: '67 Hill Station Road', city: 'Nuwara Eliya', district: District.NUWARA_ELIYA, province: Province.CENTRAL } }),
    
    // Southern Province
    prisma.address.create({ data: { addressLine1: '89 Wakwella Road', city: 'Galle', district: District.GALLE, province: Province.SOUTHERN } }),
    prisma.address.create({ data: { addressLine1: '156 Beach Road', city: 'Matara', district: District.MATARA, province: Province.SOUTHERN } }),
    prisma.address.create({ data: { addressLine1: '34 Harbor Road', city: 'Hambantota', district: District.HAMBANTOTA, province: Province.SOUTHERN } }),
    
    // Northern Province
    prisma.address.create({ data: { addressLine1: '200 Hospital Road', city: 'Jaffna', district: District.JAFFNA, province: Province.NORTHERN } }),
    prisma.address.create({ data: { addressLine1: '89 Main Street', city: 'Kilinochchi', district: District.KILINOCHCHI, province: Province.NORTHERN } }),
    
    // Eastern Province
    prisma.address.create({ data: { addressLine1: '75 Harbor Road', city: 'Trincomalee', district: District.TRINCOMALEE, province: Province.EASTERN } }),
    prisma.address.create({ data: { addressLine1: '120 Station Road', city: 'Batticaloa', district: District.BATTICALOA, province: Province.EASTERN } }),
    
    // North Western Province
    prisma.address.create({ data: { addressLine1: '90 Clock Tower Road', city: 'Kurunegala', district: District.KURUNEGALA, province: Province.NORTH_WESTERN } }),
    
    // North Central Province
    prisma.address.create({ data: { addressLine1: '180 Sacred City Road', city: 'Anuradhapura', district: District.ANURADHAPURA, province: Province.NORTH_CENTRAL } }),
    
    // Uva Province
    prisma.address.create({ data: { addressLine1: '95 Hill Station Road', city: 'Badulla', district: District.BADULLA, province: Province.UVA } }),
    
    // Sabaragamuwa Province
    prisma.address.create({ data: { addressLine1: '110 Gem City Road', city: 'Ratnapura', district: District.RATNAPURA, province: Province.SABARAGAMUWA } }),
    prisma.address.create({ data: { addressLine1: '140 Mountain Road', city: 'Kegalle', district: District.KEGALLE, province: Province.SABARAGAMUWA } }),
  ])

  // Utility function to get random address
  const getRandomAddress = () => addresses[Math.floor(Math.random() * addresses.length)]

  // 5) Create Quota Settings for different vehicle and fuel types
  console.log('Creating quota settings...')
  const vehicleTypes = Object.values(VehicleType)
  const fuelTypes = Object.values(FuelType)
  
  await Promise.all(
    vehicleTypes.flatMap(vehicleType =>
      fuelTypes.map(fuelType => {
        let weeklyLimit = 0
        
        // Set realistic quota limits based on vehicle and fuel type
        switch (vehicleType) {
          case VehicleType.CAR:
            weeklyLimit = fuelType.includes('DIESEL') ? 60 : 50
            break
          case VehicleType.MOTORCYCLE:
          case VehicleType.SCOOTER:
            weeklyLimit = 20
            break
          case VehicleType.THREE_WHEELER:
            weeklyLimit = 25
            break
          case VehicleType.VAN:
            weeklyLimit = fuelType.includes('DIESEL') ? 80 : 70
            break
          case VehicleType.LORRY:
          case VehicleType.BUS:
            weeklyLimit = fuelType.includes('DIESEL') ? 200 : 150
            break
          case VehicleType.HEAVY_VEHICLE:
            weeklyLimit = fuelType.includes('DIESEL') ? 300 : 250
            break
          case VehicleType.BOAT:
            weeklyLimit = 100
            break
          default:
            weeklyLimit = 40
        }
        
        return prisma.quotaSettings.create({
          data: {
            vehicleType,
            fuelType,
            weeklyLimit
          }
        })
      })
    )
  )

  // 6) Create ADMIN users
  console.log('Creating admin users...')
  const adminUsers = await Promise.all(
    Array.from({ length: 3 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `admin${i + 1}@fuelmanagement.lk`,
          password: hashedPassword,
          firstName: `Admin`,
          lastName: `User${i + 1}`,
          phoneNumber: `0711000${(i + 1).toString().padStart(3, '0')}`,
          nicNumber: `9${(70000000 + i).toString()}V`,
          userType: UserType.ADMIN_USER,
          emailVerified: true,
          phoneVerified: true,
          addressId: getRandomAddress().id,
        },
      })
    )
  )

  // Create AdminUser records
  await Promise.all(
    adminUsers.map(user => 
      prisma.adminUser.create({ data: { userId: user.id } })
    )
  )

  // 7) Create VEHICLE_OWNER users and their vehicles
  console.log('Creating vehicle owners...')
  const vehicleOwnerUsers = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `owner${i + 1}@example.com`,
          password: hashedPassword,
          firstName: `Vehicle`,
          lastName: `Owner${i + 1}`,
          phoneNumber: `0772000${(i + 1).toString().padStart(3, '0')}`,
          nicNumber: `9${(80000000 + i).toString()}V`,
          userType: UserType.VEHICLE_OWNER,
          emailVerified: true,
          phoneVerified: true,
          addressId: getRandomAddress().id,
        },
      })
    )
  )

  const vehicleOwners = await Promise.all(
    vehicleOwnerUsers.map(user =>
      prisma.vehicleOwner.create({ 
        data: { 
          userId: user.id,
          registrationDate: new Date()
        } 
      })
    )
  )

  // 8) Create Vehicles (2-4 per owner)
  console.log('Creating vehicles...')
  const allVehicles: any[] = []
  for (const [ownerIndex, owner] of vehicleOwners.entries()) {
    const vehicleCount = Math.floor(Math.random() * 3) + 2 // 2-4 vehicles per owner
    
    for (let j = 0; j < vehicleCount; j++) {
      const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
      const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)]
      
      // Get quota settings for this vehicle/fuel combination
      const quotaSettings = await prisma.quotaSettings.findUnique({
        where: {
          vehicleType_fuelType: {
            vehicleType,
            fuelType
          }
        }
      })
      
      const vehicle = await prisma.vehicle.create({
        data: {
          registrationNumber: `${vehicleType.substring(0, 2)}${ownerIndex + 1}${j + 1}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          chassisNumber: `CHS${ownerIndex + 1}${j + 1}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          engineNumber: `ENG${ownerIndex + 1}${j + 1}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          make: ['Toyota', 'Honda', 'Nissan', 'Suzuki', 'Mitsubishi', 'Hyundai'][Math.floor(Math.random() * 6)],
          model: `Model${j + 1}`,
          vehicleType,
          fuelType,
          monthlyQuotaLimit: quotaSettings ? quotaSettings.weeklyLimit * 4 : 100, // 4 weeks in a month
          currentQuotaUsed: Math.floor(Math.random() * 50), // Random current usage
          ownerId: owner.id,
          qrCode: `QR_${ownerIndex + 1}_${j + 1}_${Date.now()}`,
          qrCodeGeneratedAt: new Date(),
          quotaResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Next month
        },
      })
      
      allVehicles.push(vehicle)
    }
  }

  // 9) Create DMTValidation records for all vehicles
  console.log('Creating DMT validations...')
  await Promise.all(
    allVehicles.map((vehicle: any) => {
      const owner = vehicleOwnerUsers.find(user => 
        vehicleOwners.find(vo => vo.id === vehicle.ownerId)?.userId === user.id
      )!
      
      return prisma.dMTValidation.create({
        data: {
          vehicleId: vehicle.id,
          registrationNumber: vehicle.registrationNumber,
          chassisNumber: vehicle.chassisNumber,
          engineNumber: vehicle.engineNumber,
          ownerNic: owner.nicNumber,
          ownerName: `${owner.firstName} ${owner.lastName}`,
        },
      })
    })
  )

  // 10) Create FUEL_STATION_OWNER users and their stations
  console.log('Creating fuel station owners...')
  const stationOwnerUsers = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `stationowner${i + 1}@fuelstations.lk`,
          password: hashedPassword,
          firstName: `Station`,
          lastName: `Owner${i + 1}`,
          phoneNumber: `0773000${(i + 1).toString().padStart(3, '0')}`,
          nicNumber: `9${(60000000 + i).toString()}V`,
          userType: UserType.FUEL_STATION_OWNER,
          emailVerified: true,
          phoneVerified: true,
          addressId: getRandomAddress().id,
        },
      })
    )
  )

  const stationOwners = await Promise.all(
    stationOwnerUsers.map((user, i) =>
      prisma.fuelStationOwner.create({
        data: {
          userId: user.id,
          businessRegNo: `BRN${(200000 + i).toString()}`,
          businessName: `Fuel Station Business ${i + 1}`,
        },
      })
    )
  )

  // 11) Create Fuel Stations
  console.log('Creating fuel stations...')
  const fuelStations = await Promise.all(
    stationOwners.map((owner, i) =>
      prisma.fuelStation.create({
        data: {
          stationCode: `FS${(i + 1).toString().padStart(3, '0')}`,
          name: `${addresses[i % addresses.length].city} Fuel Station ${i + 1}`,
          phoneNumber: `0114000${(i + 1).toString().padStart(3, '0')}`,
          licenseNumber: `LIC${(300000 + i).toString()}`,
          ownerId: owner.id,
          addressId: addresses[i % addresses.length].id,
        },
      })
    )
  )

  // 12) Create Fuel Inventory for each station
  console.log('Creating fuel inventory...')
  await Promise.all(
    fuelStations.flatMap(station =>
      fuelTypes.map(fuelType =>
        prisma.fuelInventory.create({
          data: {
            fuelStationId: station.id,
            fuelType,
            currentStock: Math.floor(Math.random() * 10000) + 5000, // 5000-15000 liters
            minimumLevel: 1000,
            maximumLevel: 20000,
            lastRefillDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
            lastRefillAmount: Math.floor(Math.random() * 5000) + 2000,
          },
        })
      )
    )
  )

  // 13) Create Fuel Prices for each station
  console.log('Creating fuel prices...')
  await Promise.all(
    fuelStations.flatMap(station =>
      fuelTypes.map(fuelType => {
        let basePrice = 0
        switch (fuelType) {
          case FuelType.PETROL_92_OCTANE:
            basePrice = 365
            break
          case FuelType.PETROL_95_OCTANE:
            basePrice = 385
            break
          case FuelType.AUTO_DIESEL:
            basePrice = 320
            break
          case FuelType.SUPER_DIESEL:
            basePrice = 340
            break
          case FuelType.KEROSENE:
            basePrice = 310
            break
        }
        
        // Add small random variation per station
        const variation = (Math.random() - 0.5) * 10 // ±5 LKR
        
        return prisma.fuelPrice.create({
          data: {
            fuelStationId: station.id,
            fuelType,
            pricePerLiter: Math.round((basePrice + variation) * 100) / 100, // Round to 2 decimal places
          },
        })
      })
    )
  )

  // 14) Create FUEL_STATION_OPERATOR users
  console.log('Creating fuel station operators...')
  const operatorUsers = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `operator${i + 1}@fuelstations.lk`,
          password: hashedPassword,
          firstName: `Operator`,
          lastName: `${i + 1}`,
          phoneNumber: `0774000${(i + 1).toString().padStart(3, '0')}`,
          nicNumber: `9${(50000000 + i).toString()}V`,
          userType: UserType.FUEL_STATION_OPERATOR,
          emailVerified: true,
          phoneVerified: true,
          addressId: getRandomAddress().id,
        },
      })
    )
  )

  const operators = await Promise.all(
    operatorUsers.map((user, i) =>
      prisma.fuelStationOperator.create({
        data: {
          userId: user.id,
          employeeId: `EMP${(i + 1).toString().padStart(4, '0')}`,
          fuelStationId: fuelStations[i % fuelStations.length].id,
        },
      })
    )
  )

  // 15) Create User Role Assignments
  console.log('Creating user role assignments...')
  const allUsers = [
    ...adminUsers,
    ...vehicleOwnerUsers,
    ...stationOwnerUsers,
    ...operatorUsers,
  ]

  await Promise.all(
    allUsers.map(user => {
      let roleId = adminRole.id
      
      switch (user.userType) {
        case UserType.VEHICLE_OWNER:
          roleId = vehicleOwnerRole.id
          break
        case UserType.FUEL_STATION_OWNER:
          roleId = stationOwnerRole.id
          break
        case UserType.FUEL_STATION_OPERATOR:
          roleId = operatorRole.id
          break
        case UserType.ADMIN_USER:
          roleId = adminRole.id
          break
      }
      
      return prisma.userRole_Assignment.create({
        data: {
          userId: user.id,
          roleId,
        },
      })
    })
  )

  // 16) Create some sample fuel transactions
  console.log('Creating sample fuel transactions...')
  await Promise.all(
    Array.from({ length: 50 }, (_, i) => {
      const vehicle = allVehicles[Math.floor(Math.random() * allVehicles.length)]
      const station = fuelStations[Math.floor(Math.random() * fuelStations.length)]
      const operator = operators.find(op => op.fuelStationId === station.id) || operators[0]
      
      const quantity = Math.random() * 50 + 10 // 10-60 liters
      const pricePerLiter = 350 + Math.random() * 50 // 350-400 LKR per liter
      const totalAmount = quantity * pricePerLiter
      
      return prisma.fuelTransaction.create({
        data: {
          fuelType: vehicle.fuelType,
          quantity: Math.round(quantity * 100) / 100,
          pricePerLiter: Math.round(pricePerLiter * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100,
          status: TransactionStatus.COMPLETED,
          qrCodeScanned: vehicle.qrCode || `QR_${vehicle.id}`,
          quotaBefore: vehicle.currentQuotaUsed,
          quotaAfter: vehicle.currentQuotaUsed + quantity,
          vehicleId: vehicle.id,
          fuelStationId: station.id,
          operatorId: operator.id,
          transactionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        },
      })
    })
  )

  // 17) Create some SMS logs
  console.log('Creating SMS logs...')
  await Promise.all(
    Array.from({ length: 30 }, (_, i) => {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)]
      
      return prisma.smsLog.create({
        data: {
          phoneNumber: user.phoneNumber,
          message: `Fuel transaction completed. Transaction ID: TXN${i + 1}. Thank you for using our service.`,
          messageType: 'TRANSACTION_CONFIRMATION',
          status: 'SENT',
          twilioSid: `SM${Math.random().toString(36).substring(2, 15)}`,
        },
      })
    })
  )

  console.log('🎉 Database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log(`   • ${adminUsers.length} Admin users`)
  console.log(`   • ${vehicleOwnerUsers.length} Vehicle owners`)
  console.log(`   • ${allVehicles.length} Vehicles`)
  console.log(`   • ${stationOwnerUsers.length} Station owners`)
  console.log(`   • ${fuelStations.length} Fuel stations`)
  console.log(`   • ${operatorUsers.length} Station operators`)
  console.log(`   • ${permissions.length} Permissions`)
  console.log(`   • ${addresses.length} Addresses across all provinces`)
  console.log(`   • Fuel inventory and prices for all stations`)
  console.log(`   • 50 sample fuel transactions`)
  console.log(`   • 30 SMS log entries`)
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
