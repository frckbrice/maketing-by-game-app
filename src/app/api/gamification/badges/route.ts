import { adminFirestore } from '@/lib/firebase/admin';
import { gamificationService } from '@/lib/services/gamificationService';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { FieldPath } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Get user's badges
    const userBadgesSnapshot = await adminFirestore
      .collection('userBadges')
      .where('userId', '==', user.id)
      .orderBy('earnedAt', 'desc')
      .get();

    const userBadges = userBadgesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get badge details for each user badge
    const badgeIds = userBadges.map(ub => (ub as any).badgeId);
    const badges = [];

    if (badgeIds.length > 0) {
      const badgesSnapshot = await adminFirestore
        .collection('badges')
        .where(FieldPath.documentId(), 'in', badgeIds)
        .get();

      const badgeMap = new Map();
      badgesSnapshot.docs.forEach(doc => {
        badgeMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      badges.push(
        ...userBadges.map(userBadge => ({
          ...userBadge,
          badgeDetails: badgeMap.get((userBadge as any).badgeId),
        }))
      );
    }

    return NextResponse.json({
      success: true,
      badges,
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);

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

    // Check for new badges the user might have earned
    const newBadges = await gamificationService.checkAndAwardBadges(user.id);

    return NextResponse.json({
      success: true,
      newBadges,
      message: `${newBadges.length} new badges earned`,
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
