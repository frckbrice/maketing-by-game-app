import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { gamificationService } from '@/lib/services/gamificationService';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const streak = await gamificationService.getUserDailyStreak(user.id);

    return NextResponse.json({
      success: true,
      streak,
    });
  } catch (error) {
    console.error('Error fetching daily streak:', error);

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

    const { streakUpdated, pointsAwarded } =
      await gamificationService.updateDailyStreak(user.id);

    return NextResponse.json({
      success: true,
      streakUpdated,
      pointsAwarded,
    });
  } catch (error) {
    console.error('Error updating daily streak:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
