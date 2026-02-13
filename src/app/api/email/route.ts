import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      subject,
      html,
      text,
      type,
      userEmail,
      companyName,
      status,
      rejectionReason,
    } = body;

    // Create reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.PROJECT_MAIL,
        pass: process.env.PROJECT_PASSWORD,
      },
    });

    let emailSubject: string;
    let emailHtml: string;

    if (type === 'vendor-application') {
      if (status === 'APPROVED') {
        emailSubject = '🎉 Vendor Application Approved!';
        emailHtml = `
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
                  <li>Create and manage lottery games</li>
                  <li>Track your earnings and analytics</li>
                  <li>Manage your business profile</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_LOCAL_APP_URL}/en/vendor-dashboard" 
                   style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
                If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        `;
      } else {
        emailSubject = 'Vendor Application Update';
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Vendor Application Update</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Application Status: ${status}</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Your vendor application for <strong>${companyName}</strong> has been reviewed.
              </p>
              
              ${
                rejectionReason
                  ? `
                <div style="background: #ffeaea; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
                  <h3 style="color: #d32f2f; margin: 0 0 10px 0;">Feedback</h3>
                  <p style="color: #d32f2f; margin: 0;">${rejectionReason}</p>
                </div>
              `
                  : ''
              }
              
              <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
                If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        `;
      }
    } else {
      // Default email
      emailSubject = subject;
      emailHtml = html;
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"Lottery App" <${process.env.PROJECT_MAIL}>`,
      to: to || userEmail,
      subject: emailSubject,
      text: text || emailHtml.replace(/<[^>]*>/g, ''),
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
