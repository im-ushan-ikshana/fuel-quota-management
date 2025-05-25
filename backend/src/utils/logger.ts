/**
 * Logger utility for consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  enableConsole?: boolean;
  enableTimestamp?: boolean;
}

class Logger {
  private context: string;
  private options: LoggerOptions;

  constructor(context: string, options: LoggerOptions = {}) {
    this.context = context;
    this.options = {
      enableConsole: true,
      enableTimestamp: true,
      ...options,
    };
  }

  /**
   * Format a log message with context and timestamp
   */
  private formatMessage(message: string): string {
    const timestamp = this.options.enableTimestamp ? `[${new Date().toISOString()}]` : '';
    return `${timestamp} [${this.context}] ${message}`;
  }

  /**
   * Log a debug message
   */
  debug(message: string | object, ...args: any[]): void {
    if (process.env.DEBUG !== 'true') return;
    
    const formattedMsg = typeof message === 'string' 
      ? this.formatMessage(message) 
      : this.formatMessage(JSON.stringify(message));
      
    console.debug('\x1b[34m%s\x1b[0m', formattedMsg, ...args);
  }

  /**
   * Log an info message
   */
  info(message: string | object, ...args: any[]): void {
    const formattedMsg = typeof message === 'string' 
      ? this.formatMessage(message) 
      : this.formatMessage(JSON.stringify(message));
      
    console.info('\x1b[32m%s\x1b[0m', formattedMsg, ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string | object, ...args: any[]): void {
    const formattedMsg = typeof message === 'string' 
      ? this.formatMessage(message) 
      : this.formatMessage(JSON.stringify(message));
      
    console.warn('\x1b[33m%s\x1b[0m', formattedMsg, ...args);
  }

  /**
   * Log an error message
   */
  error(message: string | object, ...args: any[]): void {
    const formattedMsg = typeof message === 'string' 
      ? this.formatMessage(message) 
      : this.formatMessage(JSON.stringify(message));
      
    console.error('\x1b[31m%s\x1b[0m', formattedMsg, ...args);
  }

  /**
   * Log query information (for database operations)
   */
  query(query: string, params?: any, duration?: number): void {
    if (process.env.DEBUG !== 'true') return;
    
    const durationStr = duration ? ` (${duration}ms)` : '';
    this.debug(`Query${durationStr}: ${query}`);
    
    if (params) {
      this.debug(`Params: ${JSON.stringify(params)}`);
    }
  }
}

/**
 * Create a new logger with the given context
 */
export function createLogger(context: string, options?: LoggerOptions): Logger {
  return new Logger(context, options);
}

/**
 * Default logger instance
 */
export const logger = createLogger('app');
