import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

async function main() {
  console.log('Start seeding database...')
  
  // Clear existing data (if needed for re-runs)
  console.log('Cleaning existing data...')
  await prisma.fuel_Transaction.deleteMany({})
  await prisma.fuel_Quota.deleteMany({})
  await prisma.vehicle.deleteMany({})
  await prisma.fuel_Station.deleteMany({})
  await prisma.user_Role.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.role.deleteMany({})
  await prisma.department_of_Motor_Traffic.deleteMany({})

  console.log('Creating roles...')
  // Create roles
  const adminRole = await prisma.role.create({
    data: { role_name: 'ADMIN' },
  })

  const userRole = await prisma.role.create({
    data: { role_name: 'USER' },
  })

  const stationOwnerRole = await prisma.role.create({
    data: { role_name: 'STATION_OWNER' },
  })

  const stationOperatorRole = await prisma.role.create({
    data: { role_name: 'STATION_OPERATOR' },
  })

  console.log('Creating users...')
  // Create admin user
  const adminPasswordHash = await hashPassword('admin123')
  const admin = await prisma.user.create({
    data: {
      full_name: 'Admin User',
      nic: '901234567V',
      email: 'admin@fuelquota.lk',
      phone_number: '0712345678',
      password_hash: adminPasswordHash,
    },
  })

  // Create regular users
  const user1PasswordHash = await hashPassword('user123')
  const user1 = await prisma.user.create({
    data: {
      full_name: 'Kamal Perera',
      nic: '902345678V',
      email: 'kamal@gmail.com',
      phone_number: '0723456789',
      password_hash: user1PasswordHash,
    },
  })

  const user2PasswordHash = await hashPassword('user456')
  const user2 = await prisma.user.create({
    data: {
      full_name: 'Nimal Silva',
      nic: '903456789V',
      email: 'nimal@gmail.com',
      phone_number: '0734567890',
      password_hash: user2PasswordHash,
    },
  })

  const user3PasswordHash = await hashPassword('user789')
  const user3 = await prisma.user.create({
    data: {
      full_name: 'Priya Mendis',
      nic: '917856432V',
      email: 'priya@gmail.com',
      phone_number: '0771234567',
      password_hash: user3PasswordHash,
    },
  })
  // Create station owners
  const ownerPasswordHash = await hashPassword('owner123')
  const stationOwner = await prisma.user.create({
    data: {
      full_name: 'Saman Fernando',
      nic: '904567890V',
      email: 'saman@ceypetco.lk',
      phone_number: '0745678901',
      password_hash: ownerPasswordHash,
    },
  })

  const owner2PasswordHash = await hashPassword('owner456')
  const stationOwner2 = await prisma.user.create({
    data: {
      full_name: 'Ranjith Perera',
      nic: '885673421V',
      email: 'ranjith@lanka-ioc.lk',
      phone_number: '0769876543',
      password_hash: owner2PasswordHash,
    },
  })
  // Create station operators
  const operatorPasswordHash = await hashPassword('operator123')
  const stationOperator = await prisma.user.create({
    data: {
      full_name: 'Sunil Dissanayake',
      nic: '905678901V',
      email: 'sunil@ioc.lk',
      phone_number: '0756789012',
      password_hash: operatorPasswordHash,
    },
  })

  const operator2PasswordHash = await hashPassword('operator456')
  const stationOperator2 = await prisma.user.create({
    data: {
      full_name: 'Lasith Kumara',
      nic: '906789012V',
      email: 'lasith@ceypetco.lk',
      phone_number: '0778901234',
      password_hash: operator2PasswordHash,
    },
  })

  console.log('Assigning roles to users...')
  // Assign roles to users
  await prisma.user_Role.create({
    data: {
      user_id: admin.user_id,
      role_id: adminRole.role_id,
    },
  })

  await prisma.user_Role.create({
    data: {
      user_id: user1.user_id,
      role_id: userRole.role_id,
    },
  })

  await prisma.user_Role.create({
    data: {
      user_id: user2.user_id,
      role_id: userRole.role_id,
    },
  })

  await prisma.user_Role.create({
    data: {
      user_id: stationOwner.user_id,
      role_id: stationOwnerRole.role_id,
    },
  })
  await prisma.user_Role.create({
    data: {
      user_id: stationOperator.user_id,
      role_id: stationOperatorRole.role_id,
    },
  })
  
  await prisma.user_Role.create({
    data: {
      user_id: user3.user_id,
      role_id: userRole.role_id,
    },
  })
  
  await prisma.user_Role.create({
    data: {
      user_id: stationOwner2.user_id,
      role_id: stationOwnerRole.role_id,
    },
  })
  
  await prisma.user_Role.create({
    data: {
      user_id: stationOperator2.user_id,
      role_id: stationOperatorRole.role_id,
    },
  })

  console.log('Creating vehicles in DMT registry...')
  // Create Department of Motor Traffic records
  const dmt1 = await prisma.department_of_Motor_Traffic.create({
    data: {
      registration_no: 'CAR-1234',
      chassis_no: 'CH123456789',
      engine_no: 'EN123456789',
      owner_nic: user1.nic,
      vehicle_brand: 'Toyota',
      vehicle_model: 'Corolla',
      vehicle_type: 'Car',
      registered_date: new Date('2023-05-10'),
    },
  })

  const dmt2 = await prisma.department_of_Motor_Traffic.create({
    data: {
      registration_no: 'VAN-5678',
      chassis_no: 'CH234567890',
      engine_no: 'EN234567890',
      owner_nic: user1.nic,
      vehicle_brand: 'Nissan',
      vehicle_model: 'Urvan',
      vehicle_type: 'Van',
      registered_date: new Date('2023-06-15'),
    },
  })
  const dmt3 = await prisma.department_of_Motor_Traffic.create({
    data: {
      registration_no: 'BIKE-9012',
      chassis_no: 'CH345678901',
      engine_no: 'EN345678901',
      owner_nic: user2.nic,
      vehicle_brand: 'Honda',
      vehicle_model: 'CBR',
      vehicle_type: 'Motorcycle',
      registered_date: new Date('2023-07-20'),
    },
  })
  
  const dmt4 = await prisma.department_of_Motor_Traffic.create({
    data: {
      registration_no: '3WHEEL-4567',
      chassis_no: 'CH456789012',
      engine_no: 'EN456789012',
      owner_nic: user2.nic,
      vehicle_brand: 'Bajaj',
      vehicle_model: 'RE',
      vehicle_type: 'Three-Wheeler',
      registered_date: new Date('2024-01-15'),
    },
  })
  
  const dmt5 = await prisma.department_of_Motor_Traffic.create({
    data: {
      registration_no: 'LORRY-7890',
      chassis_no: 'CH567890123',
      engine_no: 'EN567890123',
      owner_nic: user3.nic,
      vehicle_brand: 'Tata',
      vehicle_model: 'Ultra',
      vehicle_type: 'Lorry',
      registered_date: new Date('2024-02-10'),
    },
  })

  console.log('Creating vehicles...')
  // Create vehicles linked to users
  const vehicle1 = await prisma.vehicle.create({
    data: {
      registration_no: 'CAR-1234',
      chassis_no: 'CH123456789',
      engine_no: 'EN123456789',
      vehicle_type: 'Car',
      qr_code: 'QR-CAR1234-' + Math.random().toString(36).substring(2, 10),
      user_id: user1.user_id,
    },
  })

  const vehicle2 = await prisma.vehicle.create({
    data: {
      registration_no: 'VAN-5678',
      chassis_no: 'CH234567890',
      engine_no: 'EN234567890',
      vehicle_type: 'Van',
      qr_code: 'QR-VAN5678-' + Math.random().toString(36).substring(2, 10),
      user_id: user1.user_id,
    },
  })
  const vehicle3 = await prisma.vehicle.create({
    data: {
      registration_no: 'BIKE-9012',
      chassis_no: 'CH345678901',
      engine_no: 'EN345678901',
      vehicle_type: 'Motorcycle',
      qr_code: 'QR-BIKE9012-' + Math.random().toString(36).substring(2, 10),
      user_id: user2.user_id,
    },
  })
  
  const vehicle4 = await prisma.vehicle.create({
    data: {
      registration_no: '3WHEEL-4567',
      chassis_no: 'CH456789012',
      engine_no: 'EN456789012',
      vehicle_type: 'Three-Wheeler',
      qr_code: 'QR-3WHEEL4567-' + Math.random().toString(36).substring(2, 10),
      user_id: user2.user_id,
    },
  })
  
  const vehicle5 = await prisma.vehicle.create({
    data: {
      registration_no: 'LORRY-7890',
      chassis_no: 'CH567890123',
      engine_no: 'EN567890123',
      vehicle_type: 'Lorry',
      qr_code: 'QR-LORRY7890-' + Math.random().toString(36).substring(2, 10),
      user_id: user3.user_id,
    },
  })

  console.log('Creating fuel stations...')
  // Create fuel stations owned by station owner
  const station1 = await prisma.fuel_Station.create({
    data: {
      station_name: 'Ceypetco Colombo Main',
      station_license: 'FS-001-COL',
      address: '123 Galle Road, Colombo 03',
      district: 'Colombo',
      owner_user_id: stationOwner.user_id,
    },
  })
  const station2 = await prisma.fuel_Station.create({
    data: {
      station_name: 'IOC Kandy Branch',
      station_license: 'FS-002-KAN',
      address: '456 Peradeniya Road, Kandy',
      district: 'Kandy',
      owner_user_id: stationOwner.user_id,
    },
  })
  
  const station3 = await prisma.fuel_Station.create({
    data: {
      station_name: 'Lanka IOC Galle',
      station_license: 'FS-003-GAL',
      address: '789 Matara Road, Galle',
      district: 'Galle',
      owner_user_id: stationOwner2.user_id,
    },
  })
  
  const station4 = await prisma.fuel_Station.create({
    data: {
      station_name: 'Ceypetco Negombo',
      station_license: 'FS-004-NEG',
      address: '321 Beach Road, Negombo',
      district: 'Gampaha',
      owner_user_id: stationOwner.user_id,
    },
  })
  
  const station5 = await prisma.fuel_Station.create({
    data: {
      station_name: 'Lanka IOC Jaffna',
      station_license: 'FS-005-JAF',
      address: '654 KKS Road, Jaffna',
      district: 'Jaffna',
      owner_user_id: stationOwner2.user_id,
    },
  })

  console.log('Creating fuel quotas...')
  // Create fuel quotas for vehicles
  const quota1 = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle1.vehicle_id,
      allocated_litres: 20.0,
      used_litres: 5.0,
      quota_period: 'May 2025',
    },
  })

  const quota2 = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle2.vehicle_id,
      allocated_litres: 30.0,
      used_litres: 10.0,
      quota_period: 'May 2025',
    },
  })
  const quota3 = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle3.vehicle_id,
      allocated_litres: 10.0,
      used_litres: 2.0,
      quota_period: 'May 2025',
    },
  })
  
  const quota4 = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle4.vehicle_id,
      allocated_litres: 15.0,
      used_litres: 8.0,
      quota_period: 'May 2025',
    },
  })
  
  const quota5 = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle5.vehicle_id,
      allocated_litres: 50.0,
      used_litres: 25.0,
      quota_period: 'May 2025',
    },
  })
  
  // Historical quota data for April 2025
  const quota1Apr = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle1.vehicle_id,
      allocated_litres: 20.0,
      used_litres: 20.0, // Fully used
      quota_period: 'April 2025',
    },
  })
  
  const quota2Apr = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle2.vehicle_id,
      allocated_litres: 30.0,
      used_litres: 25.0,
      quota_period: 'April 2025',
    },
  })
  
  const quota3Apr = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle3.vehicle_id,
      allocated_litres: 10.0,
      used_litres: 8.0,
      quota_period: 'April 2025',
    },
  })
  
  // Historical quota data for March 2025
  const quota1Mar = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle1.vehicle_id,
      allocated_litres: 20.0,
      used_litres: 18.0,
      quota_period: 'March 2025',
    },
  })
  
  const quota2Mar = await prisma.fuel_Quota.create({
    data: {
      vehicle_id: vehicle2.vehicle_id,
      allocated_litres: 30.0,
      used_litres: 28.0,
      quota_period: 'March 2025',
    },
  })

  console.log('Creating fuel transactions...')
  // Create fuel transactions for vehicles
  const transaction1 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle1.vehicle_id,
      station_id: station1.station_id,
      operator_user_id: stationOperator.user_id,
      pumped_litres: 5.0,
      transaction_time: new Date('2025-05-10T10:30:00'),
    },
  })

  const transaction2 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle2.vehicle_id,
      station_id: station1.station_id,
      operator_user_id: stationOperator.user_id,
      pumped_litres: 10.0,
      transaction_time: new Date('2025-05-12T14:45:00'),
    },
  })
  const transaction3 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle3.vehicle_id,
      station_id: station2.station_id,
      operator_user_id: stationOperator.user_id,
      pumped_litres: 2.0,
      transaction_time: new Date('2025-05-15T09:15:00'),
    },
  })
  
  const transaction4 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle4.vehicle_id,
      station_id: station3.station_id,
      operator_user_id: stationOperator2.user_id,
      pumped_litres: 8.0,
      transaction_time: new Date('2025-05-16T11:30:00'),
    },
  })
  
  const transaction5 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle5.vehicle_id,
      station_id: station4.station_id,
      operator_user_id: stationOperator.user_id,
      pumped_litres: 15.0,
      transaction_time: new Date('2025-05-18T14:00:00'),
    },
  })
  
  const transaction6 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle5.vehicle_id,
      station_id: station5.station_id,
      operator_user_id: stationOperator2.user_id,
      pumped_litres: 10.0,
      transaction_time: new Date('2025-05-20T16:45:00'),
    },
  })
  
  // Historical transactions from April 2025
  const transaction7 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle1.vehicle_id,
      station_id: station1.station_id,
      operator_user_id: stationOperator.user_id,
      pumped_litres: 10.0,
      transaction_time: new Date('2025-04-05T10:00:00'),
    },
  })
  
  const transaction8 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle1.vehicle_id,
      station_id: station2.station_id,
      operator_user_id: stationOperator.user_id,
      pumped_litres: 10.0,
      transaction_time: new Date('2025-04-20T15:30:00'),
    },
  })
  
  const transaction9 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle2.vehicle_id,
      station_id: station3.station_id,
      operator_user_id: stationOperator2.user_id,
      pumped_litres: 15.0,
      transaction_time: new Date('2025-04-10T13:15:00'),
    },
  })
  
  const transaction10 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle2.vehicle_id,
      station_id: station4.station_id,
      operator_user_id: stationOperator.user_id,
      pumped_litres: 10.0,
      transaction_time: new Date('2025-04-25T09:45:00'),
    },
  })
  
  // Historical transactions from March 2025
  const transaction11 = await prisma.fuel_Transaction.create({
    data: {
      vehicle_id: vehicle3.vehicle_id,
      station_id: station5.station_id,
      operator_user_id: stationOperator2.user_id,
      pumped_litres: 8.0,
      transaction_time: new Date('2025-03-15T11:00:00'),
    },
  })

  console.log('Seeding completed successfully!')
}

// Execute the main function
main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    // Close Prisma client connection
    await prisma.$disconnect()
  })
