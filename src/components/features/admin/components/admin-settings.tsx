'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Bell,
  Database,
  DollarSign,
  Globe,
  Palette,
  Save,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdateAppSettings } from '../api/mutations';
import { useAppSettings } from '../api/queries';
import { AppSettings } from '../api/type';



export function AdminSettingsPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Use TanStack Query hooks for settings
  const { data: serverSettings, isLoading: loadingSettings } = useAppSettings();
  const updateSettingsMutation = useUpdateAppSettings();

  // Local settings state for form handling
  const [localSettings, setLocalSettings] = useState<AppSettings>({
    appName: 'BlackFriday Marketing App',
    appDescription: 'Win amazing prizes with our lottery games',
    supportEmail: 'bricefrkc@gmail.com',
    maintenanceMode: false,
    defaultTicketPrice: 500,
    defaultCurrency: 'XAF',
    maxTicketsPerUser: 10,
    drawFrequency: 'weekly',
    enableStripe: true,
    enablePayPal: true,
    enableMobileMoney: true,
    minWithdrawal: 1000,
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    sessionTimeout: 30,
    primaryColor: '#FF5722',
    secondaryColor: '#FF9800',
    enableAnalytics: true,
    enableCrashReporting: true,
    updatedAt: Date.now(),
    updatedBy: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Sync server settings with local state
  useEffect(() => {
    if (serverSettings) {
      setLocalSettings(serverSettings);
    }
  }, [serverSettings]);

  const handleSaveSettings = async () => {
    // Validate user is logged in
    if (!user?.id) {
      toast.error(t('admin.errors.userNotFound', 'User not authenticated'));
      return;
    }

    try {
      const updatedSettings = {
        ...localSettings,
        updatedAt: Date.now(),
        updatedBy: user.id,
      };
      
      // Use the mutation with proper error handling
      updateSettingsMutation.mutate(updatedSettings, {
        onSuccess: () => {
          toast.success(t('admin.localSettings.saveSuccess', 'Settings saved successfully'));
        },
        onError: (error: any) => {
          console.error('Failed to save settings:', error);
          toast.error(t('admin.localSettings.saveError', 'Failed to save localSettings. Please try again.'));
        }
      });
    } catch (error) {
      console.error('Error in handleSaveSettings:', error);
      toast.error(t('admin.localSettings.saveError', 'Failed to save localSettings. Please try again.'));
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!mounted) {
    return null;
  }

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (loadingSettings) {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>{t('admin.loadingSettings')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center'>
                <SettingsIcon className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
                  Application Settings
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>
                  Configure platform settings and preferences
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleSaveSettings} 
              disabled={updateSettingsMutation.isPending}
              className='flex items-center space-x-2'
            >
              {updateSettingsMutation.isPending ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              ) : (
                <>
                  <Save className='w-4 h-4' />
                    <span>{t('admin.saveSettings')}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className='space-y-6'>
          {/* General Settings */}
          <Card className='p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <Globe className='w-5 h-5 text-blue-500' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                General Settings
              </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='appName'>Application Name</Label>
                <Input
                  id='appName'
                  value={localSettings.appName}
                  onChange={(e) => updateSetting('appName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='supportEmail'>Support Email</Label>
                <Input
                  id='supportEmail'
                  type='email'
                  value={localSettings.supportEmail}
                  onChange={(e) => updateSetting('supportEmail', e.target.value)}
                />
              </div>
            </div>
            <div className='mt-4'>
              <Label htmlFor='appDescription'>Application Description</Label>
              <Textarea
                id='appDescription'
                value={localSettings.appDescription}
                onChange={(e) => updateSetting('appDescription', e.target.value)}
                rows={3}
              />
            </div>
            <div className='flex items-center space-x-2 mt-4'>
              <Switch
                id="maintenanceMode"
                checked={localSettings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>
          </Card>

          {/* Game Settings */}
          <Card className='p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <DollarSign className='w-5 h-5 text-green-500' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Game Settings
              </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='defaultTicketPrice'>Default Ticket Price</Label>
                <Input
                  id='defaultTicketPrice'
                  type='number'
                  value={localSettings.defaultTicketPrice}
                  onChange={(e) => updateSetting('defaultTicketPrice', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor='defaultCurrency'>Default Currency</Label>
                <select
                  id='defaultCurrency'
                  value={localSettings.defaultCurrency}
                  onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md'
                >
                  <option value='XAF'>XAF - Central African Franc</option>
                  <option value='USD'>USD - US Dollar</option>
                  <option value='EUR'>EUR - Euro</option>
                </select>
              </div>
              <div>
                <Label htmlFor='maxTicketsPerUser'>Max Tickets per User</Label>
                <Input
                  id='maxTicketsPerUser'
                  type='number'
                  value={localSettings.maxTicketsPerUser}
                  onChange={(e) => updateSetting('maxTicketsPerUser', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor='drawFrequency'>Draw Frequency</Label>
                <select
                  id='drawFrequency'
                  value={localSettings.drawFrequency}
                  onChange={(e) => updateSetting('drawFrequency', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md'
                >
                  <option value='daily'>Daily</option>
                  <option value='weekly'>Weekly</option>
                  <option value='monthly'>Monthly</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Payment Settings */}
          <Card className='p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <DollarSign className='w-5 h-5 text-green-500' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Payment Settings
              </h2>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="enableStripe"
                  checked={localSettings.enableStripe}
                  onCheckedChange={(checked) => updateSetting('enableStripe', checked)}
                />
                <Label htmlFor="enableStripe">Enable Stripe Payments</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="enablePayPal"
                  checked={localSettings.enablePayPal}
                  onCheckedChange={(checked) => updateSetting('enablePayPal', checked)}
                />
                <Label htmlFor="enablePayPal">Enable PayPal Payments</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="enableMobileMoney"
                  checked={localSettings.enableMobileMoney}
                  onCheckedChange={(checked) => updateSetting('enableMobileMoney', checked)}
                />
                <Label htmlFor="enableMobileMoney">Enable Mobile Money</Label>
              </div>
              <div className='mt-4'>
                <Label htmlFor='minWithdrawal'>Minimum Withdrawal Amount</Label>
                <Input
                  id='minWithdrawal'
                  type='number'
                  value={localSettings.minWithdrawal}
                  onChange={(e) => updateSetting('minWithdrawal', parseInt(e.target.value))}
                />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className='p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <Bell className='w-5 h-5 text-yellow-500' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Notification Settings
              </h2>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="enablePushNotifications"
                  checked={localSettings.enablePushNotifications}
                  onCheckedChange={(checked) => updateSetting('enablePushNotifications', checked)}
                />
                <Label htmlFor="enablePushNotifications">Enable Push Notifications</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="enableEmailNotifications"
                  checked={localSettings.enableEmailNotifications}
                  onCheckedChange={(checked) => updateSetting('enableEmailNotifications', checked)}
                />
                <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="enableSMSNotifications"
                  checked={localSettings.enableSMSNotifications}
                  onCheckedChange={(checked) => updateSetting('enableSMSNotifications', checked)}
                />
                <Label htmlFor="enableSMSNotifications">Enable SMS Notifications</Label>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className='p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <Shield className='w-5 h-5 text-red-500' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Security Settings
              </h2>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="requireEmailVerification"
                  checked={localSettings.requireEmailVerification}
                  onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                />
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="requirePhoneVerification"
                  checked={localSettings.requirePhoneVerification}
                  onCheckedChange={(checked) => updateSetting('requirePhoneVerification', checked)}
                />
                <Label htmlFor="requirePhoneVerification">Require Phone Verification</Label>
              </div>
              <div className='mt-4'>
                <Label htmlFor='sessionTimeout'>Session Timeout (minutes)</Label>
                <Input
                  id='sessionTimeout'
                  type='number'
                  value={localSettings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className='p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <Palette className='w-5 h-5 text-purple-500' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Appearance Settings
              </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='primaryColor'>Primary Color</Label>
                <Input
                  id='primaryColor'
                  type='color'
                  value={localSettings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='secondaryColor'>Secondary Color</Label>
                <Input
                  id='secondaryColor'
                  type='color'
                  value={localSettings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Analytics Settings */}
          <Card className='p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <Database className='w-5 h-5 text-indigo-500' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Analytics & Monitoring
              </h2>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="enableAnalytics"
                  checked={localSettings.enableAnalytics}
                  onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
                />
                <Label htmlFor="enableAnalytics">Enable Analytics Tracking</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id="enableCrashReporting"
                  checked={localSettings.enableCrashReporting}
                  onCheckedChange={(checked) => updateSetting('enableCrashReporting', checked)}
                />
                <Label htmlFor="enableCrashReporting">Enable Crash Reporting</Label>
              </div>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className='mt-8 flex justify-end'>
          <Button 
            onClick={handleSaveSettings} 
            disabled={updateSettingsMutation.isPending}
            size='lg'
            className='px-8'
          >
            {updateSettingsMutation.isPending ? (
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
            ) : (
              <>
                <Save className='w-5 h-5 mr-2' />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}