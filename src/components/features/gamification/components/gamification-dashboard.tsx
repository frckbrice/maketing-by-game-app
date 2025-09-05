'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { LoyaltyPointsDisplay } from './loyalty-points-display';
import { ReferralSystem } from './referral-system';
import { DailyStreakTracker } from './daily-streak-tracker';
import { BadgesCollection } from './badges-collection';
import { GamificationNotifications } from './gamification-notifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Users, Calendar, Award, Bell } from 'lucide-react';

export const GamificationDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('loyalty');

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          {t('gamification.dashboard.title')}
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          {t('gamification.dashboard.subtitle')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='loyalty' className='flex items-center space-x-2'>
            <Star className='w-4 h-4' />
            <span className='hidden sm:inline'>
              {t('gamification.tabs.loyalty')}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='referrals'
            className='flex items-center space-x-2'
          >
            <Users className='w-4 h-4' />
            <span className='hidden sm:inline'>
              {t('gamification.tabs.referrals')}
            </span>
          </TabsTrigger>
          <TabsTrigger value='streak' className='flex items-center space-x-2'>
            <Calendar className='w-4 h-4' />
            <span className='hidden sm:inline'>
              {t('gamification.tabs.streak')}
            </span>
          </TabsTrigger>
          <TabsTrigger value='badges' className='flex items-center space-x-2'>
            <Award className='w-4 h-4' />
            <span className='hidden sm:inline'>
              {t('gamification.tabs.badges')}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='notifications'
            className='flex items-center space-x-2'
          >
            <Bell className='w-4 h-4' />
            <span className='hidden sm:inline'>
              {t('gamification.tabs.notifications')}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='loyalty' className='space-y-6'>
          <LoyaltyPointsDisplay />
        </TabsContent>

        <TabsContent value='referrals' className='space-y-6'>
          <ReferralSystem />
        </TabsContent>

        <TabsContent value='streak' className='space-y-6'>
          <DailyStreakTracker />
        </TabsContent>

        <TabsContent value='badges' className='space-y-6'>
          <BadgesCollection />
        </TabsContent>

        <TabsContent value='notifications' className='space-y-6'>
          <GamificationNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
};
