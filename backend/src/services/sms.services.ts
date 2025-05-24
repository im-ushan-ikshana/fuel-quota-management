import twilio from 'twilio';
import { createLogger } from '../utils/logger';

const logger = createLogger('SmsService');

export interface SmsMessage {
  phoneNumber: string;
  message: string;
  messageType: string;
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SmsService {
  private twilioClient: twilio.Twilio;
  private fromPhoneNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken || !this.fromPhoneNumber) {
      logger.warn('Twilio credentials not configured. SMS functionality will be disabled.');
      throw new Error('Twilio configuration incomplete');
    }

    this.twilioClient = twilio(accountSid, authToken);
  }

  /**
   * Send SMS message
   */
  async sendSms(smsData: SmsMessage): Promise<SmsResponse> {
    try {
      logger.info(`Sending SMS to ${smsData.phoneNumber} - Type: ${smsData.messageType}`);

      const message = await this.twilioClient.messages.create({
        body: smsData.message,
        from: this.fromPhoneNumber,
        to: smsData.phoneNumber
      });

      logger.info(`SMS sent successfully - SID: ${message.sid}`);

      // Log to database
      await this.logSmsToDatabase({
        phoneNumber: smsData.phoneNumber,
        message: smsData.message,
        messageType: smsData.messageType,
        status: 'sent',
        twilioSid: message.sid
      });

      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      logger.error('Error sending SMS:', error);

      // Log failed attempt to database
      await this.logSmsToDatabase({
        phoneNumber: smsData.phoneNumber,
        message: smsData.message,
        messageType: smsData.messageType,
        status: 'failed',
        twilioSid: null
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send verification code SMS
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<SmsResponse> {
    const message = `Your fuel quota verification code is: ${code}. This code will expire in 10 minutes.`;
    
    return this.sendSms({
      phoneNumber,
      message,
      messageType: 'verification'
    });
  }

  /**
   * Send welcome SMS
   */
  async sendWelcomeSms(phoneNumber: string, firstName: string): Promise<SmsResponse> {
    const message = `Welcome to Fuel Quota Management System, ${firstName}! Your account has been successfully created.`;
    
    return this.sendSms({
      phoneNumber,
      message,
      messageType: 'welcome'
    });
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<SmsResponse> {
    const message = `Your password reset code is: ${code}. This code will expire in 10 minutes. If you didn't request this, please ignore.`;
    
    return this.sendSms({
      phoneNumber,
      message,
      messageType: 'password_reset'
    });
  }

  /**
   * Send quota notification SMS
   */
  async sendQuotaNotification(phoneNumber: string, remainingQuota: number, vehicleNumber: string): Promise<SmsResponse> {
    const message = `Vehicle ${vehicleNumber} has ${remainingQuota}L fuel quota remaining for this week. Plan your fuel usage accordingly.`;
    
    return this.sendSms({
      phoneNumber,
      message,
      messageType: 'quota_notification'
    });
  }

  /**
   * Log SMS to database
   */
  private async logSmsToDatabase(logData: {
    phoneNumber: string;
    message: string;
    messageType: string;
    status: string;
    twilioSid: string | null;
  }): Promise<void> {
    try {
      // Import here to avoid circular dependency
      const PrismaService = (await import('../services/prisma.services')).default;
      const prismaService = PrismaService.getInstance();
      const prisma = prismaService.getClient();

      await prisma.smsLog.create({
        data: {
          phoneNumber: logData.phoneNumber,
          message: logData.message,
          messageType: logData.messageType,
          status: logData.status,
          twilioSid: logData.twilioSid
        }
      });
    } catch (error) {
      logger.error('Error logging SMS to database:', error);
      // Don't throw error here as it's just logging
    }
  }

  /**
   * Get SMS logs for a phone number
   */
  async getSmsLogs(phoneNumber: string, limit: number = 50) {
    try {
      const PrismaService = (await import('../services/prisma.services')).default;
      const prismaService = PrismaService.getInstance();
      const prisma = prismaService.getClient();

      return await prisma.smsLog.findMany({
        where: { phoneNumber },
        orderBy: { sentAt: 'desc' },
        take: limit
      });
    } catch (error) {
      logger.error('Error getting SMS logs:', error);
      throw error;
    }
  }

  /**
   * Check if phone number is valid (basic validation)
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    // Sri Lankan phone number validation
    const sriLankanPattern = /^\+94[0-9]{9}$|^0[0-9]{9}$/;
    return sriLankanPattern.test(phoneNumber);
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Convert local format to international
    if (phoneNumber.startsWith('0')) {
      return '+94' + phoneNumber.substring(1);
    }
    if (!phoneNumber.startsWith('+')) {
      return '+94' + phoneNumber;
    }
    return phoneNumber;
  }
}

export default SmsService;
