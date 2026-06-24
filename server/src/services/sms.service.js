/**
 * Free OTP Verification Service
 * Uses Nodemailer (Ethereal free testing) instead of paid Twilio SMS.
 */

const logger = require('../config/logger');
const crypto = require('crypto');
const cache = require('./cache.service');
const nodemailer = require('nodemailer');

class FreeOtpService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  async initTransporter() {
    // Generate a free Ethereal test account (100% free, no signup)
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    logger.info(`[FreeOTP] Nodemailer initialized with Ethereal Email: ${testAccount.user}`);
  }

  /**
   * Send OTP via Free Email
   */
  async sendOTP(email) {
    if (!this.transporter) {
      await this.initTransporter();
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP in Redis/Cache for 5 minutes
    await cache.set(`otp:${email}`, otp, 300);

    const info = await this.transporter.sendMail({
      from: '"Community Hero Verification" <noreply@communityhero.in>',
      to: email,
      subject: 'Your Community Hero OTP Code',
      text: `Your Verification Code is: ${otp}`,
      html: `<b>Your Verification Code is: ${otp}</b>`,
    });

    logger.info(`[FreeOTP] Sent Email OTP to ${email}`);
    logger.info(`[FreeOTP] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    
    return { success: true, message: 'OTP sent to email', previewUrl: nodemailer.getTestMessageUrl(info) };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email, submittedOtp) {
    const storedOtp = await cache.get(`otp:${email}`);
    if (!storedOtp) {
      throw new Error('OTP expired or not found');
    }
    
    if (storedOtp !== submittedOtp) {
      throw new Error('Invalid OTP');
    }

    // Clean up
    await cache.del(`otp:${email}`);
    
    return { success: true };
  }
}

module.exports = new FreeOtpService();
