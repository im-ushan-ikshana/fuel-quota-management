import PrismaService from '../services/prisma.services';
import { handlePrismaError } from '../utils/prisma.middleware';
import { createLogger } from '../utils/logger';
import { UserType, District, Province } from '@prisma/client';

const logger = createLogger('AuthRepository');

interface fuelInventory {
  fuelType: string;
  currentStockLiters: number;
  minimumLevelLiters: number;
  maximumLevelLiters: number;
}

interface fuelStationInfo {
  stationCode: string;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  address: CreateAddressData;
  info: fuelInventory;
}

interface oneVehicle {
  registrationNumber: string;
  engineNumber: string;
  chassisNumber: string;
  make: string;
  model: string;
  vehicleType: string;
  fuelType: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber: string;
  userType: UserType;
  addressId: string;
  vehicleInfo?: oneVehicle;
  stationInfo?: fuelStationInfo;
}

export interface UserWithRelations {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber: string;
  userType: UserType;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  addressId: string;
  address?: {
    id: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    district: District;
    province: Province;
  };
  userRoles?: {
    id: string;
    userId: string;
    roleId: string;
    assignedAt: Date;
    isActive: boolean;
    role: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
}

export interface SessionData {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

export interface CreateAddressData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: District;
  province: Province;
}

class AuthRepository {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<UserWithRelations | null> {
    try {
      const prisma = this.prismaService.getClient();

      return await prisma.user.findUnique({
        where: { email },
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw handlePrismaError(error, 'finding user by email');
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(userId: string): Promise<UserWithRelations | null> {
    try {
      const prisma = this.prismaService.getClient();

      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw handlePrismaError(error, 'finding user by ID');
    }
  }

  /**
   * Find user by phone number
   */
  async findUserByPhoneNumber(phoneNumber: string): Promise<UserWithRelations | null> {
    try {
      const prisma = this.prismaService.getClient();

      return await prisma.user.findUnique({
        where: { phoneNumber },
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding user by phone number:', error);
      throw handlePrismaError(error, 'finding user by phone number');
    }
  }

  /**
   * Find user by NIC number
   */
  async findUserByNic(nicNumber: string): Promise<UserWithRelations | null> {
    try {
      const prisma = this.prismaService.getClient();

      return await prisma.user.findUnique({
        where: { nicNumber },
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding user by NIC:', error);
      throw handlePrismaError(error, 'finding user by NIC number');
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<UserWithRelations> {
    try {
      const prisma = this.prismaService.getClient();

      return await prisma.user.create({
        data: userData,
        include: {
          address: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      throw handlePrismaError(error, 'creating user');
    }
  }  /**
   * Create a Vehicle Owner
   * @param userData - User data including vehicle information
   * @returns The newly created vehicle owner with user details
   */
  async createVehicleOwner(userData: CreateUserData): Promise<{
    id: string;
    userId: string;
    registrationDate: Date;
    user: UserWithRelations;
  }> {
    try {
      const prisma = this.prismaService.getClient();
        // First create a user with type VEHICLE_OWNER
      // Remove vehicleInfo from userData before creating User since it's not part of the User model
      const { vehicleInfo, ...userDataWithoutVehicle } = userData;
      
      const userWithVehicleOwnerType = {
        ...userDataWithoutVehicle,
        userType: UserType.VEHICLE_OWNER
      };
      
      // Use a transaction to ensure all related records are created properly
      const result = await prisma.$transaction(async (tx) => {
        // Create the user
        const user = await tx.user.create({
          data: userWithVehicleOwnerType,
          include: {
            address: true,
            userRoles: {
              where: { isActive: true },
              include: {
                role: true
              }
            }
          }
        });
        
        // Create the vehicle owner record linked to the user
        const vehicleOwner = await tx.vehicleOwner.create({
          data: {
            userId: user.id
          },
          include: {
            user: {
              include: {
                address: true,
                userRoles: {
                  where: { isActive: true },
                  include: {
                    role: true
                  }
                }
              }
            }
          }
        });
        
        // If vehicle information is provided, create the vehicle
        if (userData.vehicleInfo) {
          const vehicleData = {
            registrationNumber: userData.vehicleInfo.registrationNumber,
            chassisNumber: userData.vehicleInfo.chassisNumber,
            engineNumber: userData.vehicleInfo.engineNumber,
            make: userData.vehicleInfo.make,
            model: userData.vehicleInfo.model,
            vehicleType: userData.vehicleInfo.vehicleType as any, // Conversion to VehicleType enum
            fuelType: userData.vehicleInfo.fuelType as any, // Conversion to FuelType enum
            ownerId: vehicleOwner.id,
            isActive: true
          };
          
          await tx.vehicle.create({
            data: vehicleData
          });
        }
        
        return vehicleOwner;
      });
      
      return result;
    } catch (error) {
      logger.error('Error creating vehicle owner:', error);
      throw handlePrismaError(error, 'creating vehicle owner');
    }
  }  /**
   * Create a Fuel Station Owner
   * @param userData - User data including station owner information
   * @param businessData - Business registration information
   * @returns The newly created fuel station owner with user details
   */
  async createFuelStationOwner(
    userData: CreateUserData, 
    businessData: { 
      businessRegNo: string; 
      businessName: string;
    }
  ): Promise<{
    id: string;
    userId: string;
    businessRegNo: string;
    businessName: string;
    user: UserWithRelations;
  }> {
    try {
      const prisma = this.prismaService.getClient();
        // First create a user with type FUEL_STATION_OWNER
      // Remove stationInfo from userData before creating User since it's not part of the User model
      const { stationInfo, ...userDataWithoutStation } = userData;
      
      const userWithStationOwnerType = {
        ...userDataWithoutStation,
        userType: UserType.FUEL_STATION_OWNER
      };
      
      // Use a transaction to ensure all related records are created properly
      const result = await prisma.$transaction(async (tx) => {
        // Create the user
        const user = await tx.user.create({
          data: userWithStationOwnerType,
          include: {
            address: true,
            userRoles: {
              where: { isActive: true },
              include: {
                role: true
              }
            }
          }
        });
        
        // Create the fuel station owner record linked to the user
        const fuelStationOwner = await tx.fuelStationOwner.create({
          data: {
            userId: user.id,
            businessRegNo: businessData.businessRegNo,
            businessName: businessData.businessName
          },
          include: {
            user: {
              include: {
                address: true,
                userRoles: {
                  where: { isActive: true },
                  include: {
                    role: true
                  }
                }
              }
            }
          }
        });
        
        // If station information is provided, create the fuel station
        if (userData.stationInfo) {
          // Create a new address for the fuel station
          const stationAddressData = {
            ...userData.stationInfo.address,
          };
          
          const stationAddress = await tx.address.create({
            data: stationAddressData
          });
          
          // Create the fuel station
          const fuelStationData = {
            stationCode: userData.stationInfo.stationCode,
            name: userData.stationInfo.name,
            phoneNumber: userData.stationInfo.phoneNumber,
            licenseNumber: userData.stationInfo.licenseNumber,
            ownerId: fuelStationOwner.id,
            addressId: stationAddress.id,
            isActive: true
          };
          
          const fuelStation = await tx.fuelStation.create({
            data: fuelStationData
          });
          
          // Create fuel inventory record
          if (userData.stationInfo.info) {
            await tx.fuelInventory.create({
              data: {
                fuelType: userData.stationInfo.info.fuelType as any,
                currentStockLiters: userData.stationInfo.info.currentStockLiters,
                minimumLevelLiters: userData.stationInfo.info.minimumLevelLiters,
                maximumLevelLiters: userData.stationInfo.info.maximumLevelLiters,
                fuelStationId: fuelStation.id
              }
            });
          }
        }
        
        return fuelStationOwner;
      });
      
      return result;
    } catch (error) {
      logger.error('Error creating fuel station owner:', error);
      throw handlePrismaError(error, 'creating fuel station owner');
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating user password:', error);
      throw handlePrismaError(error, 'updating user password');
    }
  }

  /**
   * Update user last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw handlePrismaError(error, 'updating user last login');
    }
  }

  /**
   * Update email verification status
   */
  async updateEmailVerification(userId: string, verified: boolean): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: verified,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating email verification:', error);
      throw handlePrismaError(error, 'updating email verification');
    }
  }

  /**
   * Update phone verification status
   */
  async updatePhoneVerification(userId: string, verified: boolean): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.user.update({
        where: { id: userId },
        data: {
          phoneVerified: verified,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating phone verification:', error);
      throw handlePrismaError(error, 'updating phone verification');
    }
  }

  /**
   * Create a new session
   */
  async createSession(sessionData: SessionData): Promise<{ sessionId: string }> {
    try {
      const prisma = this.prismaService.getClient();

      const session = await prisma.session.create({
        data: {
          userId: sessionData.userId,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
          expiresAt: sessionData.expiresAt,
          isActive: true
        }
      });

      return { sessionId: session.sessionId };
    } catch (error) {
      logger.error('Error creating session:', error);
      throw handlePrismaError(error, 'creating session');
    }
  }

  /**
   * Find session by session ID
   */
  async findSessionById(sessionId: string) {
    try {
      const prisma = this.prismaService.getClient();

      return await prisma.session.findUnique({
        where: {
          sessionId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: {
            include: {
              address: true,
              userRoles: {
                where: { isActive: true },
                include: {
                  role: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding session:', error);
      throw handlePrismaError(error, 'finding session');
    }
  }

  /**
   * Update session last accessed time
   */
  async updateSessionLastAccessed(sessionId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.session.update({
        where: { sessionId },
        data: {
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating session last accessed:', error);
      throw handlePrismaError(error, 'updating session last accessed');
    }
  }

  /**
   * Invalidate session (mark as inactive)
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.session.update({
        where: { sessionId },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error invalidating session:', error);
      throw handlePrismaError(error, 'invalidating session');
    }
  }

  /**
   * Delete expired sessions
   */
  async deleteExpiredSessions(): Promise<number> {
    try {
      const prisma = this.prismaService.getClient();

      const result = await prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false }
          ]
        }
      });

      return result.count;
    } catch (error) {
      logger.error('Error deleting expired sessions:', error);
      throw handlePrismaError(error, 'deleting expired sessions');
    }
  }

  /**
   * Create address
   */
  async createAddress(addressData: CreateAddressData): Promise<{ id: string }> {
    try {
      const prisma = this.prismaService.getClient();

      const address = await prisma.address.create({
        data: addressData
      });

      return { id: address.id };
    } catch (error) {
      logger.error('Error creating address:', error);
      throw handlePrismaError(error, 'creating address');
    }
  }

  /**
   * Check if user exists by email, phone, or NIC
   */
  async checkUserExists(email: string, phoneNumber: string, nicNumber: string): Promise<{
    emailExists: boolean;
    phoneExists: boolean;
    nicExists: boolean;
  }> {
    try {
      const prisma = this.prismaService.getClient();

      const [emailUser, phoneUser, nicUser] = await Promise.all([
        prisma.user.findUnique({ where: { email }, select: { id: true } }),
        prisma.user.findUnique({ where: { phoneNumber }, select: { id: true } }),
        prisma.user.findUnique({ where: { nicNumber }, select: { id: true } })
      ]);

      return {
        emailExists: !!emailUser,
        phoneExists: !!phoneUser,
        nicExists: !!nicUser
      };
    } catch (error) {
      logger.error('Error checking user existence:', error);
      throw handlePrismaError(error, 'checking user existence');
    }
  }
  /**
   * check a fuel station already exists
   * @param stationCode - The unique code for the station
   * @param licenseNumber - The license number of the station
   * @returns An object indicating whether a station with the given code or license exists
   */
  async checkFuelStationExists(stationCode: string, licenseNumber: string): Promise<{
    stationCodeExists: boolean;
    licenseNumberExists: boolean;
  }> {
    try {
      const prisma = this.prismaService.getClient();

      const [stationByCode, stationByLicense] = await Promise.all([
        prisma.fuelStation.findUnique({ where: { stationCode }, select: { id: true } }),
        prisma.fuelStation.findUnique({ where: { licenseNumber }, select: { id: true } })
      ]);

      return {
        stationCodeExists: !!stationByCode,
        licenseNumberExists: !!stationByLicense
      };
    } catch (error) {
      logger.error('Error checking fuel station existence:', error);
      throw handlePrismaError(error, 'checking fuel station existence');
    }
  }
  /**
   * Check if a vehicle already exists by registration number or chassis number
   * @param registrationNumber - The registration number of the vehicle
   * @param chassisNumber - The chassis number of the vehicle
   * @returns An object indicating whether a vehicle with the given registration or chassis number exists
   */
  async checkVehicleExists(registrationNumber: string, chassisNumber: string): Promise<{
    registrationExists: boolean;
    chassisExists: boolean;
  }> {
    try {
      const prisma = this.prismaService.getClient();

      const [vehicleByRegistration, vehicleByChassis] = await Promise.all([
        prisma.vehicle.findUnique({ where: { registrationNumber }, select: { id: true } }),
        prisma.vehicle.findUnique({ where: { chassisNumber }, select: { id: true } })
      ]);

      return {
        registrationExists: !!vehicleByRegistration,
        chassisExists: !!vehicleByChassis
      };
    } catch (error) {
      logger.error('Error checking vehicle existence:', error);
      throw handlePrismaError(error, 'checking vehicle existence');
    }
  }

  /**
   * Assign role to user
   */
  async assignUserRole(userId: string, roleId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.userRole_Assignment.create({
        data: {
          userId,
          roleId,
          isActive: true
        }
      });
    } catch (error) {
      logger.error('Error assigning user role:', error);
      throw handlePrismaError(error, 'assigning user role');
    }
  }

  /**
   * Remove role from user
   */
  async removeUserRole(userId: string, roleId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.userRole_Assignment.updateMany({
        where: { userId, roleId },
        data: { isActive: false }
      });
    } catch (error) {
      logger.error('Error removing user role:', error);
      throw handlePrismaError(error, 'removing user role');
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string) {
    try {
      const prisma = this.prismaService.getClient();

      return await prisma.userRole_Assignment.findMany({
        where: {
          userId,
          isActive: true
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error getting user roles:', error);
      throw handlePrismaError(error, 'getting user roles');
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw handlePrismaError(error, 'deactivating user');
    }
  }

  /**
   * Activate user account
   */
  async activateUser(userId: string): Promise<void> {
    try {
      const prisma = this.prismaService.getClient();

      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: true,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error activating user:', error);
      throw handlePrismaError(error, 'activating user');
    }
  }
}

export default AuthRepository;