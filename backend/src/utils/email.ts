import nodemailer from 'nodemailer';
import path from 'path';

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: any;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const getEmailTemplate = (template: string, data: any): string => {
  switch (template) {
    case 'emailVerification':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Email Verification - FruitBowl</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f1743e; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #f1743e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to FruitBowl!</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name},</h2>
              <p>Thank you for registering with FruitBowl. Please verify your email address by clicking the button below:</p>
              <a href="${data.verificationLink}" class="button">Verify Email</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p>${data.verificationLink}</p>
              <p>This verification link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 FruitBowl. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'passwordReset':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Password Reset - FruitBowl</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f1743e; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #f1743e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name},</h2>
              <p>We received a request to reset your password for your FruitBowl account.</p>
              <a href="${data.resetLink}" class="button">Reset Password</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p>${data.resetLink}</p>
              <div class="warning">
                <p><strong>Important:</strong> This password reset link will expire in 30 minutes for security reasons.</p>
                <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 FruitBowl. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'orderConfirmation':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Order Confirmation - FruitBowl</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.customerName},</h2>
              <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
                <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
              </div>
              <p>You can track your order status in your account dashboard.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 FruitBowl. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return `
        <h1>Email from FruitBowl</h1>
        <p>Thank you for using our service!</p>
      `;
  }
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = getEmailTemplate(options.template, options.data);
    
    const mailOptions = {
      from: `FruitBowl <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
