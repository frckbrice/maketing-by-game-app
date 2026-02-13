import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFCM } from '@/hooks/useFCM';
import { AlertCircle, Bell, BellOff, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const NotificationPermission: React.FC = () => {
  const { t } = useTranslation();
  const { fcmToken, isInitialized, error, requestPermission } = useFCM();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isInitialized) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            {t('notifications.setup')}
          </CardTitle>
          <CardDescription>{t('notifications.initializing')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fcmToken) {
    return (
      <Card className='w-full max-w-md mx-auto border-green-200 bg-green-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-green-800'>
            <CheckCircle className='h-5 w-5' />
            {t('notifications.enabled')}
          </CardTitle>
          <CardDescription className='text-green-600'>
            {t('notifications.enabledDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-green-700'>
            <p>{t('notifications.pushActive')}</p>
            <p>{t('notifications.emailEnabled')}</p>
            <p>{t('notifications.fcmConfigured')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='w-full max-w-md mx-auto border-red-200 bg-red-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-red-800'>
            <AlertCircle className='h-5 w-5' />
            {t('notifications.setupFailed')}
          </CardTitle>
          <CardDescription className='text-red-600'>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className='w-full'
          >
            {t('notifications.tryAgain')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BellOff className='h-5 w-5' />
          {t('notifications.enableNotifications')}
        </CardTitle>
        <CardDescription>
          {t('notifications.enableDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='text-sm text-gray-600 space-y-2'>
          <p>{t('notifications.pushNotifications')}</p>
          <p>{t('notifications.emailNotifications')}</p>
          <p>{t('notifications.personalized')}</p>
        </div>

        <Button
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className='w-full'
          size='lg'
        >
          {isRequesting ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              {t('notifications.requestingPermission')}
            </>
          ) : (
            <>
              <Bell className='h-4 w-4 mr-2' />
              {t('notifications.enableNotificationsButton')}
            </>
          )}
        </Button>

        <p className='text-xs text-gray-500 text-center'>
          {t('notifications.changeLater')}
        </p>
      </CardContent>
    </Card>
  );
};

export default NotificationPermission;
