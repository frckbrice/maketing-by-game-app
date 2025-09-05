import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { gamificationService } from '@/lib/services/gamificationService';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const referralProfile = await gamificationService.getUserReferralProfile(
      user.id
    );

    return NextResponse.json({
      success: true,
      profile: referralProfile,
    });
  } catch (error) {
    console.error('Error fetching referral profile:', error);

    if (
      error instanceof Error &&
      error.message.includes('Authentication required')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { action, referralCode } = body;

    if (action === 'generate_code') {
      const code = await gamificationService.generateReferralCode(user.id);
      return NextResponse.json({
        success: true,
        referralCode: code,
      });
    }

    if (action === 'apply_referral') {
      if (!referralCode) {
        return NextResponse.json(
          { error: 'Referral code is required' },
          { status: 400 }
        );
      }

      const success = await gamificationService.processReferral(
        referralCode,
        user.id
      );

      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Referral applied successfully',
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired referral code' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in referrals POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
