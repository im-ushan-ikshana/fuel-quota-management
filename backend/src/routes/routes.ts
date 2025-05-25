import { Router, Request, Response } from "express";

const mainRouter = Router();

// GET /api/v1/main - Main route info
mainRouter.get('/', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Main routes - Fuel Quota Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/v1/main',
      'GET /api/v1/main/status'
    ]
  });
});

// GET /api/v1/main/status - System status
mainRouter.get('/status', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'System status check',
    data: {
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        authentication: 'active',
        api: 'running'
      }
    }
  });
});

export default mainRouter;
