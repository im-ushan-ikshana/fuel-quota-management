import { Router, Request, Response } from "express";
import { authenticateJWT } from '../utils/jwt.middleware';
import { requirePermission, AuthenticatedRequest } from '../utils/permissions';
import FuelOperatorService from '../services/fuelOperators.services';
import { OperatorLoginCredentials } from '../repositories/fuelOperators.repo';
import TransactionService, { FuelPumpingRequest } from '../services/transactions.services';
import { createLogger } from '../utils/logger';
import { FuelType } from '@prisma/client';

const fuelOperatorRouter = Router();
const fuelOperatorService = new FuelOperatorService();
const transactionService = new TransactionService();
const logger = createLogger('FuelOperatorRoutes');

/**
 * POST /api/v1/fuel-operators/login
 * Operator login for mobile app
 */
fuelOperatorRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials: OperatorLoginCredentials = req.body;

    // Validate required fields
    if (!credentials.email || !credentials.password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    logger.info(`Login attempt for operator: ${credentials.email}`);

    const loginResponse = await fuelOperatorService.authenticateOperator(credentials);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: loginResponse,
    });

  } catch (error) {
    logger.error('Error during operator login:', error);
    
    if (error instanceof Error) {
      // Handle specific authentication errors
      if (error.message.includes('Invalid email or password') || 
          error.message.includes('Account is deactivated') ||
          error.message.includes('Fuel station is not active')) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error during login',
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
      });
    }
  }
});

/**
 * POST /api/v1/transactions/scan-qr
 * Scan vehicle QR code and return quota & vehicle info
 */
fuelOperatorRouter.post('/transactions/scan-qr', 
  authenticateJWT,
  requirePermission('vehicle', 'create'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { qrCode } = req.body;

      if (!qrCode) {
        res.status(400).json({
          success: false,
          message: 'QR code is required',
        });
        return;
      }

      logger.info(`QR scan request from operator: ${req.user?.id}`);

      const vehicleInfo = await fuelOperatorService.scanVehicleQR(qrCode);

      res.status(200).json({
        success: true,
        message: 'QR code scanned successfully',
        data: vehicleInfo,
      });

    } catch (error) {
      logger.error('Error scanning QR code:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error while scanning QR code',
        });
      }
    }
  }
);

/**
 * POST /api/v1/transactions/pump
 * Record new fuel pumping for a vehicle
 */
fuelOperatorRouter.post('/transactions/pump',
  authenticateJWT,
  requirePermission('fuel_station', 'create'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { qrCode, vehicleId, fuelType, quantityLiters, fuelStationId } = req.body;

      // Validate required fields
      const requiredFields = ['qrCode', 'vehicleId', 'fuelType', 'quantityLiters', 'fuelStationId'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
          missingFields,
        });
        return;
      }

      // Validate fuel type
      const validFuelTypes = Object.values(FuelType);
      if (!validFuelTypes.includes(fuelType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid fuel type',
          validFuelTypes,
        });
        return;
      }

      // Validate quantity
      if (typeof quantityLiters !== 'number' || quantityLiters <= 0) {
        res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number',
        });
        return;
      }

      // Get operator ID from authenticated user
      const operatorProfile = await fuelOperatorService.getOperatorProfileByUserId(req.user!.id);

      const pumpingRequest: FuelPumpingRequest = {
        qrCode,
        vehicleId,
        fuelStationId,
        operatorId: operatorProfile.id,
        fuelType,
        quantityLiters,
      };

      logger.info(`Fuel pumping request from operator: ${operatorProfile.employeeId}, Vehicle: ${vehicleId}, Quantity: ${quantityLiters}L`);

      const transaction = await transactionService.processFuelPumping(pumpingRequest);

      res.status(201).json({
        success: true,
        message: 'Fuel pumping recorded successfully',
        data: {
          transaction,
        },
      });

    } catch (error) {
      logger.error('Error recording fuel pumping:', error);
      
      if (error instanceof Error) {
        // Handle specific business logic errors
        if (error.message.includes('Insufficient quota') ||
            error.message.includes('Vehicle not found') ||
            error.message.includes('Invalid QR code') ||
            error.message.includes('Vehicle is not active') ||
            error.message.includes('requires') && error.message.includes('but') && error.message.includes('was requested')) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Internal server error while recording fuel pumping',
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error while recording fuel pumping',
        });
      }
    }
  }
);

/**
 * GET /api/v1/transactions/:id
 * View specific transaction
 */
fuelOperatorRouter.get('/transactions/:id',
  authenticateJWT,
  requirePermission('fuel_station', 'read'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required',
        });
        return;
      }

      logger.info(`Transaction details request for ID: ${id}`);

      const transaction = await transactionService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Transaction details retrieved successfully',
        data: {
          transaction,
        },
      });

    } catch (error) {
      logger.error('Error fetching transaction details:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error while fetching transaction details',
        });
      }
    }
  }
);

/**
 * GET /api/v1/fuel-operators/me
 * View own operator profile
 */
fuelOperatorRouter.get('/me',
  authenticateJWT,
  requirePermission('vehicle', 'create'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      logger.info(`Profile request for user: ${req.user.id}`);

      const operatorProfile = await fuelOperatorService.getOperatorProfileByUserId(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Operator profile retrieved successfully',
        data: {
          operator: operatorProfile,
        },
      });

    } catch (error) {
      logger.error('Error fetching operator profile:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Operator not found')) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Internal server error while fetching profile',
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error while fetching profile',
        });
      }
    }
  }
);

// Legacy placeholder routes - these can be removed or updated as needed

// GET /api/v1/fuel/operators - Get all operators
fuelOperatorRouter.get('/', requirePermission('fuel_station', 'read'), (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Fuel operators retrieved successfully',
    data: {
      operators: [],
      total: 0,
      page: 1,
      limit: 50
    }
  });
});

// POST /api/v1/fuel/operators - Create operator
fuelOperatorRouter.post('/', requirePermission('fuel_station', 'create'), (req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    message: 'Fuel operator creation not implemented yet'
  });
});

// GET /api/v1/fuel/operators/:id - Get operator by ID
fuelOperatorRouter.get('/:id', requirePermission('fuel_station', 'read'), (req: Request, res: Response): void => {
  const { id } = req.params;
  res.status(404).json({
    success: false,
    message: `Fuel operator with ID ${id} not found`
  });
});

// PUT /api/v1/fuel/operators/:id - Update operator
fuelOperatorRouter.put('/:id', requirePermission('fuel_station', 'update'), (req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    message: 'Fuel operator update not implemented yet'
  });
});

// DELETE /api/v1/fuel/operators/:id - Delete operator
fuelOperatorRouter.delete('/:id', requirePermission('fuel_station', 'delete'), (req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    message: 'Fuel operator deletion not implemented yet'
  });
});

export default fuelOperatorRouter;
