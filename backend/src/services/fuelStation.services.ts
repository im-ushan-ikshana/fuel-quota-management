import { createLogger } from '../utils/logger';
import FuelStationRepository, { 
  CreateFuelStationData, 
  FuelStationWithDetails, 
  FuelStationInventory, 
  FuelPriceInfo,
  FuelStationSearchFilters,
  FuelStationListResponse
} from '../repositories/fuelStation.repo';
import { FuelType, District, Province } from '@prisma/client';

const logger = createLogger('FuelStationService');

export interface RegisterFuelStationRequest {
  stationCode: string;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  province: string;
  postalCode?: string;
  owner: {
    businessName: string;
    businessRegNo: string;
    userId: string;
  };
  fuelTypes: FuelType[];
  operatingHours?: {
    open: string;
    close: string;
  };
}

class FuelStationService {
  private fuelStationRepository: FuelStationRepository;

  constructor() {
    this.fuelStationRepository = new FuelStationRepository();
  }

  /**
   * Register a new fuel station
   */
  async registerFuelStation(requestData: RegisterFuelStationRequest): Promise<any> {
    try {
      logger.info(`Starting fuel station registration for: ${requestData.stationCode}`);

      // Convert request data to repository format
      const stationData: CreateFuelStationData = {
        stationCode: requestData.stationCode,
        name: requestData.name,
        phoneNumber: requestData.phoneNumber,
        licenseNumber: requestData.licenseNumber,
        address: {
          addressLine1: requestData.addressLine1,
          addressLine2: requestData.addressLine2,
          city: requestData.city,
          district: requestData.district as District,
          province: requestData.province as Province,
          postalCode: requestData.postalCode,
        },
        owner: requestData.owner,
        fuelTypes: requestData.fuelTypes,
        operatingHours: requestData.operatingHours,
      };

      const fuelStation = await this.fuelStationRepository.registerFuelStation(stationData);

      logger.info(`Fuel station registered successfully: ${fuelStation.stationCode}`);
      return fuelStation;
    } catch (error) {
      logger.error('Error in fuel station registration:', error);
      throw error;
    }
  }

  /**
   * Get fuel station details by ID
   */
  async getFuelStationById(stationId: string): Promise<FuelStationWithDetails | null> {
    try {
      logger.info(`Fetching fuel station details for ID: ${stationId}`);
      
      const station = await this.fuelStationRepository.getFuelStationById(stationId);
      
      if (!station) {
        logger.warn(`Fuel station not found: ${stationId}`);
        return null;
      }

      return station;
    } catch (error) {
      logger.error(`Error fetching fuel station:`, error);
      throw error;
    }
  }
  /**
   * Get all fuel stations with optional filters
   */
  async getAllFuelStations(
    page: number = 1,
    limit: number = 50,
    filters?: FuelStationSearchFilters
  ): Promise<FuelStationListResponse> {
    try {
      logger.info(`Fetching fuel stations - page: ${page}, limit: ${limit}`);
      
      const result = await this.fuelStationRepository.getAllFuelStations(filters, page, limit);
      
      logger.info(`Found ${result.total} fuel stations`);
      
      return {
        fuelStations: result.stations,
        total: result.total,
        page: result.currentPage,
        limit: limit
      };
    } catch (error) {
      logger.error('Error fetching fuel stations:', error);
      throw error;
    }
  }

  /**
   * Get fuel station inventory
   */
  async getFuelStationInventory(stationId: string): Promise<FuelStationInventory[]> {
    try {
      logger.info(`Fetching fuel inventory for station: ${stationId}`);
      
      const inventory = await this.fuelStationRepository.getFuelStationInventory(stationId);
      
      logger.info(`Found ${inventory.length} fuel types in inventory`);
      
      return inventory;
    } catch (error) {
      logger.error(`Error fetching fuel station inventory:`, error);
      throw error;
    }
  }

  /**
   * Get current fuel prices at station
   */
  async getFuelStationPrices(stationId: string): Promise<FuelPriceInfo[]> {
    try {
      logger.info(`Fetching fuel prices for station: ${stationId}`);
      
      const prices = await this.fuelStationRepository.getFuelStationPrices(stationId);
      
      logger.info(`Found ${prices.length} fuel price entries`);
      
      return prices;
    } catch (error) {
      logger.error(`Error fetching fuel station prices:`, error);
      throw error;
    }
  }

  /**
   * Search fuel stations by various criteria
   */
  async searchFuelStations(
    query: string,
    filters?: FuelStationSearchFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<FuelStationListResponse> {
    try {
      logger.info(`Searching fuel stations with query: ${query}`);
      
      const result = await this.fuelStationRepository.searchFuelStations(
        query,
        filters,
        page,
        limit
      );
      
      logger.info(`Found ${result.total} matching fuel stations`);
      
      return result;
    } catch (error) {
      logger.error('Error searching fuel stations:', error);
      throw error;
    }
  }
  /**
   * Update fuel station details
   */
  async updateFuelStation(
    stationId: string,
    updateData: Partial<{
      stationCode: string;
      name: string;
      phoneNumber: string;
      licenseNumber: string;
      isActive: boolean;
    }>
  ): Promise<FuelStationWithDetails> {
    try {
      logger.info(`Updating fuel station: ${stationId}`);
      
      const updatedStation = await this.fuelStationRepository.updateFuelStation(
        stationId,
        updateData
      );
      
      if (!updatedStation) {
        throw new Error('Fuel station not found');
      }
      
      logger.info(`Fuel station updated successfully: ${updatedStation.stationCode}`);
      
      return updatedStation;
    } catch (error) {
      logger.error(`Error updating fuel station:`, error);
      throw error;
    }
  }

  /**
   * Deactivate fuel station
   */
  async deactivateFuelStation(stationId: string): Promise<void> {
    try {
      logger.info(`Deactivating fuel station: ${stationId}`);
      
      await this.fuelStationRepository.deactivateFuelStation(stationId);
      
      logger.info(`Fuel station deactivated successfully: ${stationId}`);
    } catch (error) {
      logger.error(`Error deactivating fuel station:`, error);
      throw error;
    }
  }

  /**
   * Validate fuel station registration data
   */
  private validateFuelStationData(stationData: RegisterFuelStationRequest): void {
    // Validate station code format
    const stationCodePattern = /^[A-Z0-9]{3,10}$/;
    if (!stationCodePattern.test(stationData.stationCode.toUpperCase())) {
      throw new Error('Invalid station code format. Must be 3-10 alphanumeric characters');
    }

    // Validate fuel types
    const validFuelTypes = [
      'PETROL_92_OCTANE', 'PETROL_95_OCTANE', 'AUTO_DIESEL', 
      'SUPER_DIESEL', 'KEROSENE'
    ];

    if (!stationData.fuelTypes || stationData.fuelTypes.length === 0) {
      throw new Error('At least one fuel type must be specified');
    }

    for (const fuelType of stationData.fuelTypes) {
      if (!validFuelTypes.includes(fuelType)) {
        throw new Error(`Invalid fuel type: ${fuelType}`);
      }
    }

    // Validate license number
    if (!stationData.licenseNumber || stationData.licenseNumber.length < 5) {
      throw new Error('License number must be at least 5 characters long');
    }

    // Validate phone number format (Sri Lankan)
    const phonePattern = /^(0|94|\+94)?[1-9]\d{8}$/;
    if (!phonePattern.test(stationData.phoneNumber.replace(/\s+/g, ''))) {
      throw new Error('Invalid Sri Lankan phone number format');
    }

    // Validate operating hours if provided
    if (stationData.operatingHours) {
      const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timePattern.test(stationData.operatingHours.open) || 
          !timePattern.test(stationData.operatingHours.close)) {
        throw new Error('Invalid operating hours format. Use HH:MM format');
      }
    }
  }
}

export default FuelStationService;