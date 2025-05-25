import { Router, Request, Response } from "express";
import FuelStationService, { RegisterFuelStationRequest } from '../services/fuelStation.services';
import { authenticateJWT } from '../utils/jwt.middleware';
import { requirePermission, AuthenticatedRequest } from '../utils/permissions';
import { createLogger } from '../utils/logger';

const fuelStationRouter = Router();
const fuelStationService = new FuelStationService();
const logger = createLogger('FuelStationRoutes');

/**
 * POST /api/fuel-stations/register
 * Register a new fuel station
 */
fuelStationRouter.post('/register', 
  authenticateJWT,
  requirePermission('fuel_station', 'create'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stationData: RegisterFuelStationRequest = req.body;
        // Validate required fields
      const requiredFields = [
        'stationCode', 'name', 'phoneNumber', 'licenseNumber', 
        'addressLine1', 'city', 'district', 'province', 'owner', 'fuelTypes'
      ];
      
      const missingFields = requiredFields.filter(field => !stationData[field as keyof RegisterFuelStationRequest]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
          missingFields,
        });
        return;
      }

      const registeredStation = await fuelStationService.registerFuelStation(stationData);

      logger.info(`Fuel station registered successfully: ${registeredStation.stationCode}`);

      res.status(201).json({
        success: true,
        message: 'Fuel station registered successfully',
        data: {
          fuelStation: registeredStation,
        },
      });

    } catch (error) {
      logger.error('Error registering fuel station:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error during fuel station registration',
        });
      }
    }
  }
);

/**
 * GET /api/fuel-stations/search
 * Search fuel stations by query and filters
 */
fuelStationRouter.get('/search',
  authenticateJWT,
  requirePermission('fuel_station', 'read'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Extract filter parameters
      const filters: any = {};
      if (req.query.fuelType) filters.fuelType = req.query.fuelType;
      if (req.query.district) filters.district = req.query.district;
      if (req.query.province) filters.province = req.query.province;
      if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

      logger.info(`Searching fuel stations with query: "${query}", filters:`, filters);

      const result = await fuelStationService.searchFuelStations(query, filters, page, limit);

      res.status(200).json({
        success: true,
        message: 'Fuel station search completed successfully',
        data: {
          query,
          filters,
          ...result,
        },
      });

    } catch (error) {
      logger.error('Error searching fuel stations:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while searching fuel stations',
      });
    }
  }
);

/**
 * GET /api/fuel-stations/:id
 * Get details of a specific fuel station
 */
fuelStationRouter.get('/:id',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info(`Fetching fuel station details for ID: ${id}`);

      const fuelStation = await fuelStationService.getFuelStationById(id);

      if (!fuelStation) {
        res.status(404).json({
          success: false,
          message: `Fuel station with ID ${id} not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Fuel station details retrieved successfully',
        data: {
          fuelStation,
        },
      });

    } catch (error) {
      logger.error('Error fetching fuel station details:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching fuel station details',
      });
    }
  }
);

/**
 * GET /api/fuel-stations
 * List all fuel stations with optional filters
 */
fuelStationRouter.get('/',
  authenticateJWT,
  requirePermission('vehicle', 'create'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Extract filter parameters
      const filters: any = {};
      if (req.query.fuelType) filters.fuelType = req.query.fuelType;
      if (req.query.district) filters.district = req.query.district;
      if (req.query.province) filters.province = req.query.province;
      if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

      logger.info(`Fetching fuel stations - page: ${page}, limit: ${limit}, filters:`, filters);

      const result = await fuelStationService.getAllFuelStations(page, limit, filters);

      res.status(200).json({
        success: true,
        message: 'Fuel stations retrieved successfully',
        data: result,
      });

    } catch (error) {
      logger.error('Error fetching fuel stations:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching fuel stations',
      });
    }
  }
);

/**
 * GET /api/fuel-stations/:id/inventory
 * Check station's fuel inventory
 */
fuelStationRouter.get('/:id/inventory',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info(`Fetching fuel inventory for station: ${id}`);

      const inventory = await fuelStationService.getFuelStationInventory(id);

      res.status(200).json({
        success: true,
        message: 'Fuel station inventory retrieved successfully',
        data: {
          stationId: id,
          inventory,
        },
      });

    } catch (error) {
      logger.error('Error fetching fuel station inventory:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching fuel station inventory',
      });
    }
  }
);

/**
 * GET /api/fuel-stations/:id/prices
 * Get current fuel prices at the station
 */
fuelStationRouter.get('/:id/prices',
  authenticateJWT,
  requirePermission('fuel_station', 'read'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info(`Fetching fuel prices for station: ${id}`);

      const prices = await fuelStationService.getFuelStationPrices(id);

      res.status(200).json({
        success: true,
        message: 'Fuel station prices retrieved successfully',
        data: {
          stationId: id,
          prices,
        },
      });

    } catch (error) {
      logger.error('Error fetching fuel station prices:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching fuel station prices',
      });    }
  }
);

/**
 * PUT /api/fuel-stations/:id
 * Update fuel station details
 */
fuelStationRouter.put('/:id',
  authenticateJWT,
  requirePermission('fuel_station', 'update'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate that at least one field is provided for update
      const allowedFields = ['stationCode', 'name', 'phoneNumber', 'licenseNumber', 'isActive'];
      const fieldsToUpdate = Object.keys(updateData).filter(field => allowedFields.includes(field));

      if (fieldsToUpdate.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields provided for update',
          allowedFields,
        });
        return;
      }

      logger.info(`Updating fuel station: ${id}, fields: ${fieldsToUpdate.join(', ')}`);

      const updatedStation = await fuelStationService.updateFuelStation(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Fuel station updated successfully',
        data: {
          fuelStation: updatedStation,
        },
      });

    } catch (error) {
      logger.error('Error updating fuel station:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error while updating fuel station',
        });
      }
    }
  }
);

/**
 * DELETE /api/fuel-stations/:id
 * Deactivate a fuel station (soft delete)
 */
fuelStationRouter.delete('/:id',
  authenticateJWT,
  requirePermission('fuel_station', 'delete'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info(`Deactivating fuel station: ${id}`);

      await fuelStationService.deactivateFuelStation(id);

      res.status(200).json({
        success: true,
        message: 'Fuel station deactivated successfully',
        data: {
          stationId: id,
        },
      });

    } catch (error) {
      logger.error('Error deactivating fuel station:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error while deactivating fuel station',
        });
      }
    }
  }
);

export default fuelStationRouter;
