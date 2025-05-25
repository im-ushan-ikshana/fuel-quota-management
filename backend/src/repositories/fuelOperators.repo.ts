import PrismaService from '../services/prisma.services';
import { createLogger } from '../utils/logger';
import { handlePrismaError } from '../utils/prisma.middleware';
import { FuelStationOperator, User } from '@prisma/client';

const logger = createLogger('FuelOperatorRepository');

export interface FuelOperatorWithDetails {
  id: string;
  employeeId: string;
  fuelStationId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
  };
  fuelStation: {
    id: string;
    stationCode: string;
    name: string;
    phoneNumber: string;
    isActive: boolean;
  };
}

export interface OperatorLoginCredentials {
  email: string;
  password: string;
}

class FuelOperatorRepository {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Get fuel operator by user email for login
   */
  async getOperatorByEmail(email: string): Promise<FuelOperatorWithDetails | null> {
    try {
      const operator = await this.prismaService.getClient().fuelStationOperator.findFirst({
        where: {
          user: {
            email: email,
            isActive: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              isActive: true,
              password: true, // Include for login verification
            },
          },
          fuelStation: {
            select: {
              id: true,
              stationCode: true,
              name: true,
              phoneNumber: true,
              isActive: true,
            },
          },
        },
      });

      return operator as FuelOperatorWithDetails | null;
    } catch (error) {
      logger.error(`Error fetching operator by email:`, error);
      throw handlePrismaError(error, 'fetching operator by email');
    }
  }

  /**
   * Get fuel operator by ID
   */
  async getOperatorById(operatorId: string): Promise<FuelOperatorWithDetails | null> {
    try {
      const operator = await this.prismaService.getClient().fuelStationOperator.findUnique({
        where: { id: operatorId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              isActive: true,
            },
          },
          fuelStation: {
            select: {
              id: true,
              stationCode: true,
              name: true,
              phoneNumber: true,
              isActive: true,
            },
          },
        },
      });

      return operator as FuelOperatorWithDetails | null;
    } catch (error) {
      logger.error(`Error fetching operator by ID:`, error);
      throw handlePrismaError(error, 'fetching operator by ID');
    }
  }

  /**
   * Get fuel operator by user ID
   */
  async getOperatorByUserId(userId: string): Promise<FuelOperatorWithDetails | null> {
    try {
      const operator = await this.prismaService.getClient().fuelStationOperator.findUnique({
        where: { userId: userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              isActive: true,
            },
          },
          fuelStation: {
            select: {
              id: true,
              stationCode: true,
              name: true,
              phoneNumber: true,
              isActive: true,
            },
          },
        },
      });

      return operator as FuelOperatorWithDetails | null;
    } catch (error) {
      logger.error(`Error fetching operator by user ID:`, error);
      throw handlePrismaError(error, 'fetching operator by user ID');
    }
  }

  /**
   * Get all operators for a fuel station
   */
  async getOperatorsByStationId(stationId: string): Promise<FuelOperatorWithDetails[]> {
    try {
      const operators = await this.prismaService.getClient().fuelStationOperator.findMany({
        where: { 
          fuelStationId: stationId,
          user: {
            isActive: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              isActive: true,
            },
          },
          fuelStation: {
            select: {
              id: true,
              stationCode: true,
              name: true,
              phoneNumber: true,
              isActive: true,
            },
          },
        },
        orderBy: {
          user: {
            firstName: 'asc',
          },
        },
      });

      return operators as FuelOperatorWithDetails[];
    } catch (error) {
      logger.error(`Error fetching operators by station ID:`, error);
      throw handlePrismaError(error, 'fetching operators by station ID');
    }
  }
}

export default FuelOperatorRepository;