import VehicleRepository, { 
  CreateVehicleData, 
  VehicleWithOwner, 
  DMTValidationData 
} from '../repositories/vehicles.repo';
import { createLogger } from '../utils/logger';
import { FuelTransaction } from '@prisma/client';

const logger = createLogger('VehicleService');

export interface RegisterVehicleRequest {
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  make: string;
  model: string;
  vehicleType: string;
  fuelType: string;
  weeklyQuotaLiters: number;
  ownerId: string;
}

export interface VehicleQuotaInfo {
  allocatedQuota: number;
  usedQuota: number;
  remainingQuota: number;
  resetDate: Date | null;
  quotaPercentage: number;
}

export interface VehicleTransactionResponse {
  transactions: FuelTransaction[];
  totalTransactions: number;
  totalFuelConsumed: number;
  averageFuelPerTransaction: number;
}

class VehicleService {
  private vehicleRepository: VehicleRepository;

  constructor() {
    this.vehicleRepository = new VehicleRepository();
  }

  /**
   * Register a new vehicle with validation
   */
  async registerVehicle(vehicleData: RegisterVehicleRequest): Promise<VehicleWithOwner> {
    try {
      logger.info(`Starting vehicle registration for: ${vehicleData.registrationNumber}`);

      // Validate vehicle type and fuel type enums
      this.validateVehicleData(vehicleData);

      // Check if vehicle is already registered
      const existingVehicle = await this.vehicleRepository.getVehicleByRegistration(
        vehicleData.registrationNumber
      );

      if (existingVehicle) {
        throw new Error(`Vehicle with registration number ${vehicleData.registrationNumber} is already registered`);
      }

      // Validate with DMT database
      const dmtValidation = await this.vehicleRepository.validateWithDMT(vehicleData.registrationNumber);
      if (!dmtValidation) {
        throw new Error(`Vehicle registration ${vehicleData.registrationNumber} not found in DMT database`);
      }

      // Validate that provided details match DMT data
      this.validateDMTData(vehicleData, dmtValidation);

      // Create vehicle data for repository
      const createVehicleData: CreateVehicleData = {
        registrationNumber: vehicleData.registrationNumber.toUpperCase(),        chassisNumber: vehicleData.chassisNumber,
        engineNumber: vehicleData.engineNumber,
        make: vehicleData.make,
        model: vehicleData.model,
        vehicleType: vehicleData.vehicleType as any,
        fuelType: vehicleData.fuelType as any,
        weeklyQuotaLiters: vehicleData.weeklyQuotaLiters,
        ownerId: vehicleData.ownerId,
      };

      // Register vehicle
      const registeredVehicle = await this.vehicleRepository.registerVehicle(createVehicleData);

      // Store DMT validation result
      await this.vehicleRepository.storeDMTValidation(registeredVehicle.id, dmtValidation);

      logger.info(`Vehicle registered successfully: ${registeredVehicle.registrationNumber}`);

      // Return vehicle with owner details
      const vehicleWithOwner = await this.vehicleRepository.getVehicleById(registeredVehicle.id);
      if (!vehicleWithOwner) {
        throw new Error('Failed to retrieve registered vehicle');
      }

      return vehicleWithOwner;

    } catch (error) {
      logger.error(`Error in vehicle registration:`, error);
      throw error;
    }
  }

  /**
   * Validate vehicle against DMT database
   */
  async validateVehicleWithDMT(registrationNumber: string): Promise<DMTValidationData | null> {
    try {
      logger.info(`Validating vehicle with DMT: ${registrationNumber}`);
      
      const validationResult = await this.vehicleRepository.validateWithDMT(registrationNumber);
      
      if (validationResult) {
        logger.info(`DMT validation successful for: ${registrationNumber}`);
      } else {
        logger.warn(`DMT validation failed for: ${registrationNumber}`);
      }

      return validationResult;
    } catch (error) {
      logger.error(`Error validating vehicle with DMT:`, error);
      throw error;
    }
  }

  /**
   * Get vehicle details by ID
   */
  async getVehicleById(vehicleId: string): Promise<VehicleWithOwner | null> {
    try {
      logger.info(`Fetching vehicle details for ID: ${vehicleId}`);
      
      const vehicle = await this.vehicleRepository.getVehicleById(vehicleId);
      
      if (!vehicle) {
        logger.warn(`Vehicle not found: ${vehicleId}`);
        return null;
      }

      return vehicle;
    } catch (error) {
      logger.error(`Error fetching vehicle:`, error);
      throw error;
    }
  }

  /**
   * Get vehicle QR code
   */
  async getVehicleQRCode(vehicleId: string): Promise<{ qrCode: string; generatedAt: Date | null } | null> {
    try {
      logger.info(`Fetching QR code for vehicle: ${vehicleId}`);
      
      const vehicle = await this.vehicleRepository.getVehicleById(vehicleId);
      
      if (!vehicle) {
        logger.warn(`Vehicle not found: ${vehicleId}`);
        return null;
      }

      if (!vehicle.qrCode) {
        throw new Error('QR code not generated for this vehicle');
      }

      return {
        qrCode: vehicle.qrCode,
        generatedAt: vehicle.qrCodeGeneratedAt,
      };
    } catch (error) {
      logger.error(`Error fetching vehicle QR code:`, error);
      throw error;
    }
  }

  /**
   * Get vehicle transactions with analytics
   */
  async getVehicleTransactions(vehicleId: string, limit: number = 50): Promise<VehicleTransactionResponse> {
    try {
      logger.info(`Fetching transactions for vehicle: ${vehicleId}`);
      
      // Verify vehicle exists
      const vehicle = await this.vehicleRepository.getVehicleById(vehicleId);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const transactions = await this.vehicleRepository.getVehicleTransactions(vehicleId, limit);
      
      // Calculate analytics
      const totalTransactions = transactions.length;
      const totalFuelConsumed = transactions.reduce((sum, t) => sum + t.quantityLiters, 0);
      const averageFuelPerTransaction = totalTransactions > 0 ? totalFuelConsumed / totalTransactions : 0;

      return {
        transactions,
        totalTransactions,
        totalFuelConsumed,
        averageFuelPerTransaction,
      };
    } catch (error) {
      logger.error(`Error fetching vehicle transactions:`, error);
      throw error;
    }
  }

  /**
   * Get vehicle quota information with analytics
   */
  async getVehicleQuota(vehicleId: string): Promise<VehicleQuotaInfo | null> {
    try {
      logger.info(`Fetching quota information for vehicle: ${vehicleId}`);
      
      const quotaInfo = await this.vehicleRepository.getVehicleQuota(vehicleId);
      
      if (!quotaInfo) {
        logger.warn(`Vehicle not found: ${vehicleId}`);
        return null;
      }

      // Calculate quota percentage
      const quotaPercentage = quotaInfo.allocatedQuota > 0 
        ? (quotaInfo.usedQuota / quotaInfo.allocatedQuota) * 100 
        : 0;

      return {
        ...quotaInfo,
        quotaPercentage: Math.round(quotaPercentage * 100) / 100, // Round to 2 decimal places
      };
    } catch (error) {
      logger.error(`Error fetching vehicle quota:`, error);
      throw error;
    }
  }

  /**
   * Get vehicle by QR code (for fuel station operators)
   */
  async getVehicleByQRCode(qrCode: string): Promise<VehicleWithOwner | null> {
    try {
      logger.info(`Fetching vehicle by QR code: ${qrCode}`);
      
      const vehicle = await this.vehicleRepository.getVehicleByQRCode(qrCode);
      
      if (!vehicle) {
        logger.warn(`Vehicle not found for QR code: ${qrCode}`);
        return null;
      }

      return vehicle;
    } catch (error) {
      logger.error(`Error fetching vehicle by QR code:`, error);
      throw error;
    }
  }

  /**
   * Get vehicle by registration number
   */
  async getVehicleByRegistration(registrationNumber: string): Promise<VehicleWithOwner | null> {
    try {
      logger.info(`Fetching vehicle by registration: ${registrationNumber}`);
      
      const vehicle = await this.vehicleRepository.getVehicleByRegistration(registrationNumber);
      
      if (!vehicle) {
        logger.warn(`Vehicle not found for registration: ${registrationNumber}`);
        return null;
      }

      return vehicle;
    } catch (error) {
      logger.error(`Error fetching vehicle by registration:`, error);
      throw error;
    }
  }

  /**
   * Get all DMT validations for testing
   */
  async getAllDMTValidations(): Promise<any[]> {
    try {
      logger.info('Fetching all DMT validations');
      
      const dmtValidations = await this.vehicleRepository.getAllDMTValidations();
      
      logger.info(`Found ${dmtValidations.length} DMT validations`);
      return dmtValidations;
    } catch (error) {
      logger.error('Error fetching all DMT validations:', error);
      throw error;
    }
  }

  /**
   * Get count of DMT validations
   */
  async getDMTValidationsCount(): Promise<number> {
    try {
      logger.info('Counting DMT validations');
      
      const count = await this.vehicleRepository.getDMTValidationsCount();
      
      logger.info(`Total DMT validations: ${count}`);
      return count;
    } catch (error) {
      logger.error('Error counting DMT validations:', error);
      throw error;
    }
  }

  /**
   * Validate vehicle registration data
   */
  private validateVehicleData(vehicleData: RegisterVehicleRequest): void {
    const validVehicleTypes = [
      'CAR', 'MOTORCYCLE', 'SCOOTER', 'THREE_WHEELER', 'VAN', 
      'LORRY', 'BUS', 'HEAVY_VEHICLE', 'SPECIAL_PURPOSE_VEHICLE', 'BOAT', 'OTHER'
    ];

    const validFuelTypes = [
      'PETROL_92_OCTANE', 'PETROL_95_OCTANE', 'AUTO_DIESEL', 'SUPER_DIESEL', 'KEROSENE'
    ];

    if (!validVehicleTypes.includes(vehicleData.vehicleType)) {
      throw new Error(`Invalid vehicle type: ${vehicleData.vehicleType}`);
    }

    if (!validFuelTypes.includes(vehicleData.fuelType)) {
      throw new Error(`Invalid fuel type: ${vehicleData.fuelType}`);
    }    if (vehicleData.weeklyQuotaLiters <= 0) {
      throw new Error('Weekly quota limit must be greater than 0');
    }

    // Validate registration number format (basic validation)
    const regNumberPattern = /^[A-Z]{2,3}-\d{4}$/;
    if (!regNumberPattern.test(vehicleData.registrationNumber.toUpperCase())) {
      throw new Error('Invalid registration number format. Expected format: ABC-1234');
    }
  }

  /**
   * Validate provided data against DMT data
   */
  private validateDMTData(vehicleData: RegisterVehicleRequest, dmtData: DMTValidationData): void {
    if (vehicleData.registrationNumber.toUpperCase() !== dmtData.registrationNumber.toUpperCase()) {
      throw new Error('Registration number mismatch with DMT database');
    }

    if (vehicleData.chassisNumber !== dmtData.chassisNumber) {
      throw new Error('Chassis number mismatch with DMT database');
    }

    if (vehicleData.engineNumber !== dmtData.engineNumber) {
      throw new Error('Engine number mismatch with DMT database');
    }
  }
}

export default VehicleService;