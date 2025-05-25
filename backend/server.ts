import App from './src/app';
import dotenv from 'dotenv';
import { Database } from './src/config/database';
import { createLogger } from './src/utils/logger';

// Create logger
const logger = createLogger('Server');

// Load environment variables
dotenv.config();

// Enable debug logging if DEBUG environment variable is set
if (process.env.DEBUG === 'true') {
  process.env.DEBUG = '*';
}

class Server {
  private app: App;
  private database: Database;

  constructor() {
    this.app = new App();
    this.database = Database.getInstance();
    this.setupGracefulShutdown();
  }

  public start(): void {
    const port = this.app.getPort();
    // Listen on 0.0.0.0 for emulator/device access
    const server = this.app.getApp().listen(port, '0.0.0.0', () => {
      logger.info('Server Configuration:');
      logger.info(`   Port: ${port}`);
      logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`   Debug Mode: ${process.env.DEBUG === 'true' ? 'ON' : 'OFF'}`);
      logger.info(`   CORS Origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001'}`);
      logger.info(`   Process ID: ${process.pid}`);
      logger.info(`   Node Version: ${process.version}`);
      logger.info(`   Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
      logger.info('>>>  Server started successfully!');
      logger.info(`>>>  Server is running at: http://localhost:${port}`);
      logger.info(`>>>  Health check: http://localhost:${port}/health`);
      logger.info(`>>>  API endpoint: http://localhost:${port}/api`);
      logger.info('---------------------------------------------------');
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Store server reference for graceful shutdown
    this.server = server;
  }

  private server?: any;

  private setupGracefulShutdown(): void {
    // Handle process termination signals
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`\n------------------------------------------------------------\nReceived ${signal}. Starting graceful shutdown...`);

        if (this.server) {
          this.server.close(async (error?: Error) => {
            if (error) {
              logger.error('  Error during server shutdown:', error);
              process.exit(1);
            } else {
              try {
                await this.database.disconnect();
                logger.info('   Database disconnected gracefully');
              } catch (dbError) {
                logger.error('  Error during database disconnection:', dbError);
              }
              logger.info('   Server shut down gracefully');
              process.exit(0);
            }
          });

          // Force shutdown after 10 seconds
          setTimeout(() => {
            logger.warn('⚠️  Forcing shutdown after timeout');
            process.exit(1);
          }, 10000);
        } else {
          try {
            await this.database.disconnect();
            logger.info('   Database disconnected gracefully');
          } catch (dbError) {
            logger.error('  Error during database disconnection:', dbError);
          }
          process.exit(0);
        }
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('💥 Uncaught Exception:', error);
      logger.error('Stack:', error.stack);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('💥 Unhandled Rejection at:', promise);
      logger.error('Reason:', reason);
      process.exit(1);
    });

    // Log memory usage periodically in debug mode
    if (process.env.DEBUG === 'true') {
      setInterval(() => {
        const memUsage = process.memoryUsage();
        logger.info('📊 Memory Usage:', {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
        });
      }, 60000); // Every minute
    }
  }
}

// Start the server
const server = new Server();
server.start();
