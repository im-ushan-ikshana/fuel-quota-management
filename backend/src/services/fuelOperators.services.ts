import { createLogger } from '../utils/logger';
import FuelOperatorRepository, { 
  FuelOperatorWithDetails, 
  OperatorLoginCredentials 
} from '../repositories/fuelOperators.repo';
import TransactionService from './transactions.services';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const logger = createLogger('FuelOperatorService');

export interface OperatorLoginResponse {
  operator: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    station: {
      id: string;
      stationCode: string;
      name: string;
    };
  };
  accessToken: string;
  expiresIn: string;
}

export interface VehicleQuotaInfo {
  vehicle: {
    id: string;
    registrationNumber: string;
    vehicleType: string;
    fuelType: string;
    ownerName: string;
  };
  quota: {
    allocatedQuota: number;
    usedQuota: number;
    remainingQuota: number;
    quotaPercentage: number;
  };
}

class FuelOperatorService {
  private fuelOperatorRepository: FuelOperatorRepository;
  private transactionService: TransactionService;

  constructor() {
    this.fuelOperatorRepository = new FuelOperatorRepository();
    this.transactionService = new TransactionService();
  }

  /**
   * Authenticate fuel operator for mobile app login
   */
  async authenticateOperator(credentials: OperatorLoginCredentials): Promise<OperatorLoginResponse> {
    try {
      logger.info(`Authenticating operator: ${credentials.email}`);

      // Find operator by email
      const operator = await this.fuelOperatorRepository.getOperatorByEmail(credentials.email);
      
      if (!operator) {
        throw new Error('Invalid email or password');
      }

      if (!operator.user.isActive) {
        throw new Error('Account is deactivated');
      }

      if (!operator.fuelStation.isActive) {
        throw new Error('Fuel station is not active');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, (operator.user as any).password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const tokenPayload = {
        id: operator.user.id,
        operatorId: operator.id,
        email: operator.user.email,
        userType: 'FUEL_STATION_OPERATOR',
        stationId: operator.fuelStation.id,
        stationCode: operator.fuelStation.stationCode,
      };

      const accessToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      logger.info(`Operator authenticated successfully: ${operator.employeeId}`);

      return {
        operator: {
          id: operator.id,
          employeeId: operator.employeeId,
          firstName: operator.user.firstName,
          lastName: operator.user.lastName,
          email: operator.user.email,
          phoneNumber: operator.user.phoneNumber,
          station: {
            id: operator.fuelStation.id,
            stationCode: operator.fuelStation.stationCode,
            name: operator.fuelStation.name,
          },
        },
        accessToken,
        expiresIn: '24h',
      };

    } catch (error) {
      logger.error(`Error authenticating operator:`, error);
      throw error;
    }
  }

  /**
   * Scan vehicle QR code and return quota information
   */
  async scanVehicleQR(qrCode: string): Promise<VehicleQuotaInfo> {
    try {
      logger.info(`Scanning QR code: ${qrCode}`);

      // Use transaction service to get vehicle quota by QR code
      const quotaInfo = await this.transactionService.getVehicleQuotaByQRCode(qrCode);

      return quotaInfo;

    } catch (error) {
      logger.error(`Error scanning QR code:`, error);
      throw error;
    }
  }

  /**
   * Get fuel operator profile by ID
   */
  async getOperatorProfile(operatorId: string): Promise<FuelOperatorWithDetails> {
    try {
      logger.info(`Fetching operator profile: ${operatorId}`);

      const operator = await this.fuelOperatorRepository.getOperatorById(operatorId);
      
      if (!operator) {
        throw new Error('Operator not found');
      }

      return operator;

    } catch (error) {
      logger.error(`Error fetching operator profile:`, error);
      throw error;
    }
  }

  /**
   * Get fuel operator profile by user ID
   */
  async getOperatorProfileByUserId(userId: string): Promise<FuelOperatorWithDetails> {
    try {
      logger.info(`Fetching operator profile by user ID: ${userId}`);

      const operator = await this.fuelOperatorRepository.getOperatorByUserId(userId);
      
      if (!operator) {
        throw new Error('Operator not found for this user');
      }

      return operator;

    } catch (error) {
      logger.error(`Error fetching operator profile by user ID:`, error);
      throw error;
    }
  }

  /**
   * Validate operator credentials without full authentication (for quick checks)
   */
  async validateOperator(email: string): Promise<boolean> {
    try {
      const operator = await this.fuelOperatorRepository.getOperatorByEmail(email);
      return operator !== null && operator.user.isActive && operator.fuelStation.isActive;
    } catch (error) {
      logger.error(`Error validating operator:`, error);
      return false;
    }
  }
}

export default FuelOperatorService;