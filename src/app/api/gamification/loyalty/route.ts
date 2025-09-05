import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { gamificationService } from '@/lib/services/gamificationService';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const loyaltyProfile = await gamificationService.getUserLoyaltyProfile(
      user.id
    );

    return NextResponse.json({
      success: true,
      profile: loyaltyProfile,
    });
  } catch (error) {
    console.error('Error fetching loyalty profile:', error);

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
    const { action, points, description, referenceId, referenceType } = body;

    if (action !== 'award_points') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Only allow admins to manually award points
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const success = await gamificationService.awardPoints(
      user.id,
      points,
      'ADJUSTMENT',
      description || 'Manual points adjustment',
      referenceId,
      referenceType
    );

    if (success) {
      const updatedProfile = await gamificationService.getUserLoyaltyProfile(
        user.id
      );
      return NextResponse.json({
        success: true,
        profile: updatedProfile,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to award points' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in loyalty POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
