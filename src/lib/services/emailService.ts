import nodemailer from 'nodemailer';
import { APP_URL } from '../constants';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.NEXT_PUBLIC_MAIL,
        pass: process.env.NEXT_PUBLIC_PASSWORD,
      },
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Send email notification
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Verify transporter configuration
      await this.transporter.verify();

      // Send email
      const info = await this.transporter.sendMail({
        from: `"BlackFriday Marketing App" <${process.env.NEXT_PUBLIC_MAIL}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        html: emailData.html,
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send vendor application status email
  async sendVendorApplicationEmail(
    userEmail: string,
    status: 'APPROVED' | 'REJECTED',
    companyName: string,
    rejectionReason?: string
  ): Promise<boolean> {
    let subject: string;
    let html: string;

    if (status === 'APPROVED') {
      subject = '🎉 Vendor Application Approved!';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your vendor application has been approved!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Vendor Application Approved</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Great news! Your vendor application for <strong>${companyName}</strong> has been approved.
            </p>
            
            <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin: 0 0 10px 0;">What's Next?</h3>
              <ul style="color: #2e7d32; margin: 0; padding-left: 20px;">
                <li>Access your vendor dashboard</li>
                <li>Create and manage BlackFriday games</li>
                <li>Track your earnings and analytics</li>
                <li>Manage your business profile</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL || process.env.NEXT_PUBLIC_LOCAL_APP_URL}/en/vendor-dashboard" 
                 style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
          
          <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 12px;">
            <p style="margin: 0;">© 2025 BlackFriday App. All rights reserved.</p>
          </div>
        </div>
      `;
    } else {
      subject = 'Vendor Application Update';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Application Update</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your vendor application status has been updated</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Vendor Application Status</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your vendor application for <strong>${companyName}</strong> was not approved at this time.
            </p>
            
            ${
              rejectionReason
                ? `
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <h3 style="color: #856404; margin: 0 0 10px 0;">Reason for Rejection:</h3>
                <p style="color: #856404; margin: 0; line-height: 1.6;">${rejectionReason}</p>
              </div>
            `
                : ''
            }
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin: 0 0 10px 0;">Next Steps:</h3>
              <ul style="color: #1976d2; margin: 0; padding-left: 20px;">
                <li>Review the feedback provided</li>
                <li>Address any issues mentioned</li>
                <li>Submit a new application when ready</li>
                <li>Contact support if you need clarification</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL || 'http://localhost:3000'}/en/vendor-application" 
                 style="background: #2196f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Submit New Application
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              We encourage you to apply again once you've addressed the feedback.
            </p>
          </div>
          
          <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 12px;">
            <p style="margin: 0;">© 2025 BlackFriday App. All rights reserved.</p>
          </div>
        </div>
      `;
    }

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  // Send BlackFriday ticket email
  async sendTicketEmail(
    userEmail: string,
    userName: string,
    ticketData: {
      ticketNumber: string;
      gameTitle: string;
      price: number;
      currency: string;
      purchaseDate: string;
      drawDate: string;
      qrCode: string;
    }
  ): Promise<boolean> {
    const subject = `🎫 Your BlackFriday Ticket - ${ticketData.ticketNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF5722 0%, #FF9800 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">🎫 Your BlackFriday Ticket</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${ticketData.gameTitle}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; border: 2px dashed #FF5722;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Ticket Details</h2>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
              <span style="font-weight: bold; color: #666;">Ticket Number:</span>
              <span style="font-family: 'Courier New', monospace; font-weight: bold; color: #FF5722;">${ticketData.ticketNumber}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
              <span style="font-weight: bold; color: #666;">Player:</span>
              <span style="font-weight: bold;">${userName}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
              <span style="font-weight: bold; color: #666;">Price Paid:</span>
              <span style="font-weight: bold; color: #4CAF50;">${ticketData.price} ${ticketData.currency}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
              <span style="font-weight: bold; color: #666;">Purchase Date:</span>
              <span>${ticketData.purchaseDate}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0; padding: 10px; background: #fff3cd; border-radius: 5px; border: 1px solid #ffc107;">
              <span style="font-weight: bold; color: #856404;">Draw Date:</span>
              <span style="font-weight: bold; color: #856404;">${ticketData.drawDate}</span>
            </div>
            
            <div style="margin: 25px 0; padding: 20px; background: #e8f5e8; border-radius: 10px;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #2e7d32;">QR Code for Verification:</p>
              <img src="${ticketData.qrCode}" alt="Ticket QR Code" style="width: 120px; height: 120px; border: 2px solid #4CAF50; border-radius: 5px; background: white; padding: 5px;" />
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Scan this code to verify your ticket</p>
            </div>
          </div>
          
          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #1976d2; margin: 0 0 10px 0;">🍀 Good Luck!</h3>
            <ul style="color: #1976d2; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Keep this ticket safe until the draw</li>
              <li>Check the results on the draw date</li>
              <li>Winners will be notified automatically</li>
              <li>Use the QR code to verify your ticket anytime</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL || 'http://localhost:3000'}/en/profile" 
               style="background: #FF5722; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; margin: 5px;">
              View My Tickets
            </a>
            <a href="${APP_URL || 'http://localhost:3000'}/en/games" 
               style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; margin: 5px;">
              Play More Games
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 12px;">
          <p style="margin: 0;">© 2025 BlackFriday Marketing App. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  // Send general notification email
  async sendNotificationEmail(
    userEmail: string,
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error'
  ): Promise<boolean> {
    const colorMap = {
      success: '#4caf50',
      info: '#2196f3',
      warning: '#ff9800',
      error: '#f44336',
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${colorMap[type]}; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">${title}</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; line-height: 1.6; margin: 0; font-size: 16px;">${message}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL || 'http://localhost:3000'}/en/dashboard" 
               style="background: ${colorMap[type]}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 12px;">
          <p style="margin: 0;">© 2025 BlackFriday Marketing App. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: title,
      html,
    });
  }
}

export const emailService = EmailService.getInstance();
