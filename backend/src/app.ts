import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Database } from './config/database';
import { logger } from './utils/logger';
import v1router from './v1.route';

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  public port: number;
  private database: Database;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '4000', 10);
    this.database = Database.getInstance();

    this.initializeMiddlewares();
    this.initializeDatabase();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Enable CORS with detailed configuration
    const corsOptions = {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      optionsSuccessStatus: 200
    };

    this.app.use(cors(corsOptions));

    // Request logging with morgan
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Body parsing middleware
    this.app.use(bodyParser.json({ limit: '1mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

    // Custom request logging middleware for debugging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.url}`);

      if (process.env.DEBUG === 'true') {
        console.log('Headers:', req.headers);
        console.log('Query:', req.query);
        console.log('Body:', req.body);
      }

      next();
    });

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      });
    });
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.database.initialize();
      logger.info('Database connection established');

      // Add database health check route
      this.app.get('/health/db', async (req: Request, res: Response) => {
        const healthStatus = await this.database.healthCheck();
        const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

        res.status(statusCode).json(healthStatus);
      });
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      process.exit(1);
    }
  }

  private initializeRoutes(): void {
    // API routes will be added here
    this.app.get('/api', (req: Request, res: Response) => {
      res.json({
        message: 'Fuel Quota Management API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });

    // Example route for testing
    this.app.get('/api/test', (req: Request, res: Response) => {
      console.log('Test endpoint accessed');
      res.json({
        message: 'Test endpoint working!',
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9)
      });
    });

    //add v1.routes.ts here
    this.app.use('/api/v1', v1router);
    
    // 404 handler for undefined routes
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Route not found',
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    });

  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] Error:`, error.message);
      console.error('Stack:', error.stack);

      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp,
        requestId: Math.random().toString(36).substr(2, 9)
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public getPort(): number {
    return this.port;
  }
}

export default App;
