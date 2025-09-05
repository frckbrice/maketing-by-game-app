import { GamificationDashboard } from '@/components/features/gamification';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gamification Hub - Your Rewards & Progress',
  description:
    'Track your loyalty points, daily streaks, badges, and referral rewards',
};

export default function GamificationPage() {
  return <GamificationDashboard />;
}
