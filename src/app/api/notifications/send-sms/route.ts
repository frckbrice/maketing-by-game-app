import { NextRequest, NextResponse } from 'next/server';

interface SMSRequest {
  phoneNumber: string;
  message: string;
  ticketId?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SMSRequest = await request.json();
    const { phoneNumber, message, ticketId, userId } = body;

    // Validate required fields
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Validate phone number format for Cameroon
    const cleanPhone = phoneNumber.replace(/[\s-()]/g, '');
    const isValidPhone = /^(237)?(6[5-9])\d{7}$/.test(cleanPhone);

    if (!isValidPhone) {
      return NextResponse.json(
        { error: 'Invalid phone number format for Cameroon' },
        { status: 400 }
      );
    }

    // In production, integrate with SMS provider (e.g., Twilio, Nexmo, or local SMS gateway)
    // For now, we'll log the SMS and simulate success
    const smsLog = {
      phoneNumber: cleanPhone,
      message,
      ticketId,
      userId,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    console.log('SMS Log:', smsLog);

    // TODO: Integrate with actual SMS provider
    // Example with local SMS gateway or NOKASH SMS service:
    /*
    if (process.env.NODE_ENV === 'production' && process.env.SMS_API_URL) {
      const smsResponse = await fetch(process.env.SMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SMS_API_KEY}`
        },
        body: JSON.stringify({
          to: cleanPhone,
          message: message,
          from: process.env.SMS_SENDER_ID || 'LOTTERY'
        })
      });

      if (!smsResponse.ok) {
        throw new Error(`SMS API error: ${smsResponse.status}`);
      }

      const smsResult = await smsResponse.json();
      
      return NextResponse.json({
        success: true,
        messageId: smsResult.messageId,
        message: 'SMS sent successfully'
      });
    }
    */

    // Development/fallback response
    return NextResponse.json({
      success: true,
      messageId: `mock_${Date.now()}`,
      message: 'SMS sent successfully (development mode)',
      data: smsLog,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send SMS',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
