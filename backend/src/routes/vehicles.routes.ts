import { Router, Request, Response } from "express";
import VehicleService, { RegisterVehicleRequest } from '../services/vehicles.services';
import { authenticateJWT } from '../utils/jwt.middleware';
import { requirePermission, AuthenticatedRequest } from '../utils/permissions';
import { createLogger } from '../utils/logger';

const vehicleRouter = Router();
const vehicleService = new VehicleService();
const logger = createLogger('VehicleRoutes');

/**
 * POST /api/vehicles/register
 * Register a new vehicle with owner details
 */
vehicleRouter.post('/register', 
  authenticateJWT,
  requirePermission('vehicle', 'create'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const vehicleData: RegisterVehicleRequest = req.body;
        // Validate required fields
      const requiredFields = [
        'registrationNumber', 'chassisNumber', 'engineNumber', 
        'make', 'model', 'vehicleType', 'fuelType', 'weeklyQuotaLiters', 'ownerId'
      ];
      
      const missingFields = requiredFields.filter(field => !vehicleData[field as keyof RegisterVehicleRequest]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
          missingFields,
        });
        return;
      }

      const registeredVehicle = await vehicleService.registerVehicle(vehicleData);

      logger.info(`Vehicle registered successfully: ${registeredVehicle.registrationNumber}`);

      res.status(201).json({
        success: true,
        message: 'Vehicle registered successfully',
        data: {
          vehicle: registeredVehicle,
        },
      });

    } catch (error) {
      logger.error('Error registering vehicle:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error during vehicle registration',
        });
      }
    }
  }
);

/**
 * POST /api/vehicles/validate-dmt
 * Validate vehicle registration with DMT database
 */
vehicleRouter.post('/validate-dmt',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { registrationNumber } = req.body;

      if (!registrationNumber) {
        res.status(400).json({
          success: false,
          message: 'Registration number is required',
        });
        return;
      }

      logger.info(`DMT validation request for: ${registrationNumber}`);

      const dmtValidation = await vehicleService.validateVehicleWithDMT(registrationNumber);

      if (dmtValidation) {
        res.status(200).json({
          valid: true,
          success: true,
          message: 'DMT validation successful',
          data: dmtValidation,
        });
      } else {
        res.status(404).json({
          valid: false,
          success: false,
          message: 'Vehicle not found in DMT database',
          data: null,
        });
      }

    } catch (error) {
      logger.error('Error validating vehicle with DMT:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error during DMT validation',
      });
    }
  }
);

/**
 * GET /api/vehicles/:id
 * Get vehicle details and quota information
 */
vehicleRouter.get('/:id',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vehicle ID is required',
        });
        return;
      }

      const vehicle = await vehicleService.getVehicleById(id);

      if (!vehicle) {
        res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
        return;
      }

      // Get quota information
      const quotaInfo = await vehicleService.getVehicleQuota(id);

      res.status(200).json({
        success: true,
        message: 'Vehicle details retrieved successfully',
        data: {
          vehicle,
          quota: quotaInfo,
        },
      });

    } catch (error) {
      logger.error('Error fetching vehicle details:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching vehicle details',
      });
    }
  }
);

/**
 * GET /api/vehicles/:id/qr
 * Get vehicle's unique QR code
 */
vehicleRouter.get('/:id/qr',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vehicle ID is required',
        });
        return;
      }

      const qrCodeData = await vehicleService.getVehicleQRCode(id);

      if (!qrCodeData) {
        res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'QR code retrieved successfully',
        data: qrCodeData,
      });

    } catch (error) {
      logger.error('Error fetching vehicle QR code:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error while fetching QR code',
        });
      }
    }
  }
);

/**
 * GET /api/vehicles/:id/transactions?limit=50
 * Get all fuel transactions for a vehicle
 */
vehicleRouter.get('/:id/transactions',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vehicle ID is required',
        });
        return;
      }

      // Validate limit parameter
      let transactionLimit = 50; // default
      if (limit && typeof limit === 'string') {
        const parsedLimit = parseInt(limit, 10);
        if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 200) {
          res.status(400).json({
            success: false,
            message: 'Invalid limit parameter. Must be a number between 1 and 200',
          });
          return;
        }
        transactionLimit = parsedLimit;
      }

      const transactionResponse = await vehicleService.getVehicleTransactions(id, transactionLimit);

      res.status(200).json({
        success: true,
        message: 'Vehicle transactions retrieved successfully',
        data: transactionResponse,
      });

    } catch (error) {
      logger.error('Error fetching vehicle transactions:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error while fetching transactions',
        });
      }
    }
  }
);

/**
 * GET /api/vehicles/:id/quota
 * Check quota balance for a vehicle
 */
vehicleRouter.get('/:id/quota',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vehicle ID is required',
        });
        return;
      }

      const quotaInfo = await vehicleService.getVehicleQuota(id);

      if (!quotaInfo) {
        res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Vehicle quota information retrieved successfully',
        data: quotaInfo,
      });

    } catch (error) {
      logger.error('Error fetching vehicle quota:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching quota information',
      });
    }
  }
);

/**
 * GET /api/vehicles/dmt-validations
 * Get all DMT validations for testing purposes
 */
vehicleRouter.get('/dmt-validations',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      logger.info('Fetching all DMT validations');

      const dmtValidations = await vehicleService.getAllDMTValidations();

      res.status(200).json({
        success: true,
        message: 'DMT validations retrieved successfully',
        count: dmtValidations.length,
        data: dmtValidations,
      });

    } catch (error) {
      logger.error('Error fetching DMT validations:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching DMT validations',
      });
    }
  }
);

/**
 * GET /api/vehicles/dmt-count
 * Get count of DMT validations
 */
vehicleRouter.get('/dmt-count',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const count = await vehicleService.getDMTValidationsCount();

      res.status(200).json({
        success: true,
        count: count,
        message: 'Total DMT validations in database',
      });

    } catch (error) {
      logger.error('Error counting DMT validations:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while counting DMT validations',
      });
    }
  }
);

/**
 * GET /api/vehicles/qr/:qr
 * Get full vehicle details by QR code
 */
vehicleRouter.get('/qr/:qr',
  authenticateJWT,
  requirePermission('vehicle', 'read'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { qr } = req.params;

      if (!qr) {
        res.status(400).json({
          success: false,
          message: 'QR code is required',
        });
        return;
      }

      const vehicle = await vehicleService.getVehicleByQRCode(qr);

      if (!vehicle) {
        res.status(404).json({
          success: false,
          message: 'Vehicle not found for the provided QR code',
        });
        return;
      }

      // Get quota information
      const quotaInfo = await vehicleService.getVehicleQuota(vehicle.id);

      res.status(200).json({
        success: true,
        message: 'Vehicle details retrieved successfully by QR code',
        data: {
          vehicle,
          quota: quotaInfo,
        },
      });

    } catch (error) {
      logger.error('Error fetching vehicle details by QR code:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error while fetching vehicle details by QR code',
        });
      }
    }
  }
);

export default vehicleRouter;
