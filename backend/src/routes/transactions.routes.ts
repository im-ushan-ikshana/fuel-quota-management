import { Router, Request, Response } from "express";
import { authenticateJWT } from '../utils/jwt.middleware';
import { requirePermission } from '../utils/permissions';
import TransactionService, { FuelPumpingRequest } from '../services/transactions.services';
import { createLogger } from '../utils/logger';
import { FuelType, TransactionStatus } from '@prisma/client';

const transactionRouter = Router();
const transactionService = new TransactionService();
const logger = createLogger('TransactionRoutes');

// All transaction routes require authentication
transactionRouter.use(authenticateJWT);

// GET /api/v1/transactions/analytics - Transaction analytics (must come before /:id)
transactionRouter.get('/analytics', requirePermission('admin', 'reports'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'last_30_days', startDate, endDate, vehicleId, fuelStationId } = req.query;

    // Build filters based on period or custom date range
    const filters: any = {};
    
    if (startDate && endDate) {
      filters.startDate = new Date(startDate as string);
      filters.endDate = new Date(endDate as string);
    } else {
      // Set default date range based on period
      const now = new Date();
      switch (period) {
        case 'last_7_days':
          filters.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last_30_days':
          filters.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last_90_days':
          filters.startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          filters.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      filters.endDate = now;
    }

    if (vehicleId) filters.vehicleId = vehicleId as string;
    if (fuelStationId) filters.fuelStationId = fuelStationId as string;

    const analytics = await transactionService.getTransactionStats(filters);
    
    res.status(200).json({
      success: true,
      message: 'Transaction analytics retrieved successfully',
      data: {
        period,
        dateRange: {
          startDate: filters.startDate,
          endDate: filters.endDate
        },
        ...analytics
      }
    });
  } catch (error) {
    logger.error('Error fetching transaction analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/transactions/search - Search transactions (must come before /:id)
transactionRouter.get('/search', requirePermission('transaction', 'read'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, dateRange, fuelType, status, page = '1', limit = '50' } = req.query;
    
    // Build search filters
    const filters: any = {};
    if (dateRange) {
      // Parse date range if provided (format: "2024-01-01,2024-01-31")
      const dates = (dateRange as string).split(',');
      if (dates.length === 2) {
        filters.startDate = new Date(dates[0]);
        filters.endDate = new Date(dates[1]);
      }
    }
    if (fuelType) filters.fuelType = fuelType as FuelType;
    if (status) filters.status = status as TransactionStatus;

    // For simple implementation, use regular getTransactions with filters
    // TODO: Implement actual search functionality in service layer
    const result = await transactionService.getTransactions(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );
    
    res.status(200).json({
      success: true,
      message: 'Transaction search completed',
      data: {
        ...result,
        searchQuery: query,
        filters: { dateRange, fuelType, status }
      }
    });
  } catch (error) {
    logger.error('Error searching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/transactions - Get all transactions
transactionRouter.get('/', requirePermission('transaction', 'read'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', startDate, endDate, vehicleId, fuelStationId, status } = req.query;
    
    // Build filters
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (vehicleId) filters.vehicleId = vehicleId as string;
    if (fuelStationId) filters.fuelStationId = fuelStationId as string;
    if (status) filters.status = status as TransactionStatus;

    const result = await transactionService.getTransactions(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );
    
    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/transactions - Create transaction (fuel pumping)
transactionRouter.post('/', requirePermission('transaction', 'create'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrCode, vehicleId, fuelStationId, operatorId, fuelType, quantity, pricePerLiter } = req.body;

    // Validate required fields
    if (!qrCode || !vehicleId || !fuelStationId || !operatorId || !fuelType || !quantity || !pricePerLiter) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: qrCode, vehicleId, fuelStationId, operatorId, fuelType, quantity, pricePerLiter'
      });
      return;
    }

    const pumpingRequest: FuelPumpingRequest = {
      qrCode,
      vehicleId,
      fuelStationId,
      operatorId,
      fuelType: fuelType as FuelType,
      quantity: parseFloat(quantity),
      pricePerLiter: parseFloat(pricePerLiter)
    };

    const transaction = await transactionService.processFuelPumping(pumpingRequest);

    res.status(201).json({
      success: true,
      message: 'Fuel pumping transaction completed successfully',
      data: transaction
    });
  } catch (error) {
    logger.error('Error processing fuel pumping transaction:', error);
    
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to process transaction'
      });
    }
  }
});

// GET /api/v1/transactions/:id - Get transaction by ID
transactionRouter.get('/:id', requirePermission('transaction', 'read'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
      return;
    }

    const transaction = await transactionService.getTransactionById(id);

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: `Transaction with ID ${id} not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction
    });
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/v1/transactions/:id - Update transaction status
transactionRouter.put('/:id', requirePermission('transaction', 'update'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }

    // Validate status is a valid TransactionStatus
    const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    const updatedTransaction = await transactionService.updateTransactionStatus(id, status as TransactionStatus);

    res.status(200).json({
      success: true,
      message: 'Transaction status updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    logger.error('Error updating transaction status:', error);
    
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction'
      });
    }
  }
});

// DELETE /api/v1/transactions/:id - Cancel transaction
transactionRouter.delete('/:id', requirePermission('transaction', 'delete'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
      return;
    }

    const cancelledTransaction = await transactionService.cancelTransaction(id);

    res.status(200).json({
      success: true,
      message: 'Transaction cancelled successfully',
      data: cancelledTransaction
    });
  } catch (error) {
    logger.error('Error cancelling transaction:', error);
    
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to cancel transaction'
      });
    }
  }
});

// Mobile app specific routes
// GET /api/v1/transactions/quota/:qrCode - Get vehicle quota by QR code (for mobile app)
transactionRouter.get('/quota/:qrCode', requirePermission('transaction', 'read'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrCode } = req.params;

    if (!qrCode) {
      res.status(400).json({
        success: false,
        message: 'QR Code is required'
      });
      return;
    }

    const quotaInfo = await transactionService.getVehicleQuotaByQRCode(qrCode);

    res.status(200).json({
      success: true,
      message: 'Vehicle quota retrieved successfully',
      data: {
        registrationNo: quotaInfo.vehicle.registrationNumber,
        vehicleType: quotaInfo.vehicle.vehicleType,
        allocatedLitres: quotaInfo.quota.allocatedQuota,
        usedLitres: quotaInfo.quota.usedQuota,
        remainingLitres: quotaInfo.quota.remainingQuota,
        quotaPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        ownerName: quotaInfo.vehicle.ownerName,
      }
    });
  } catch (error) {
    logger.error('Error fetching vehicle quota by QR code:', error);
    
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicle quota'
      });
    }
  }
});

// POST /api/v1/transactions/pump - Pump fuel (mobile app format)
transactionRouter.post('/pump', requirePermission('transaction', 'create'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrCode, vehicleId, pumpedLitres, stationId, operatorId, fuelType, pricePerLiter } = req.body;

    // Validate required fields for mobile format
    if (!qrCode || !vehicleId || !pumpedLitres || !stationId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: qrCode, vehicleId, pumpedLitres, stationId'
      });
      return;
    }

    // Use current user as operator if not provided, or use a default
    const finalOperatorId = operatorId || (req as any).user?.id || 'system';
    const finalFuelType = fuelType || 'PETROL_92_OCTANE'; // Default fuel type
    const finalPricePerLiter = pricePerLiter || 150.00; // Default price

    const pumpingRequest: FuelPumpingRequest = {
      qrCode,
      vehicleId,
      fuelStationId: stationId,
      operatorId: finalOperatorId,
      fuelType: finalFuelType as FuelType,
      quantity: parseFloat(pumpedLitres),
      pricePerLiter: parseFloat(finalPricePerLiter.toString())
    };

    const transaction = await transactionService.processFuelPumping(pumpingRequest);

    res.status(200).json({
      success: true,
      message: 'Fuel pumped successfully',
      data: {
        transactionId: transaction.id,
        pumpedLitres: transaction.quantity,
        remainingQuota: transaction.quotaAfter,
        totalAmount: transaction.totalAmount
      }
    });
  } catch (error) {
    logger.error('Error pumping fuel:', error);
    
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to pump fuel'
      });
    }
  }
});

export default transactionRouter;
