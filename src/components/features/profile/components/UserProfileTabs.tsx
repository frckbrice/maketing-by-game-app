'use client';

import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Bell, 
  User, 
  CreditCard, 
  Shield, 
  Settings,
  Eye,
  EyeOff,
  Gamepad2,
  Download,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { User as UserType, Order, Address, UserNotificationPreferences } from '@/types';

// Add ticket and game types for completeness
interface Ticket {
  id: string;
  gameId: string;
  ticketNumber: string;
  purchaseDate: number;
  price: number;
  currency: string;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
  isWinner: boolean;
  prizeAmount?: number;
  expiresAt?: number;
}

interface Game {
  id: string;
  title: string;
  description?: string;
}

interface UserProfileTabsProps {
  user: UserType;
  orders: Order[];
  addresses: Address[];
  tickets: Ticket[];
  games: Game[];
  onProfileUpdate: (data: Partial<UserType>) => Promise<void>;
  onAddressUpdate: (addresses: Address[]) => Promise<void>;
  onNotificationUpdate: (preferences: UserNotificationPreferences) => Promise<void>;
  onTicketDownload: (ticketId: string) => Promise<void>;
}

export const UserProfileTabs: React.FC<UserProfileTabsProps> = ({
  user,
  orders,
  addresses,
  tickets,
  games,
  onProfileUpdate,
  onAddressUpdate,
  onNotificationUpdate,
  onTicketDownload
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber || '',
    bio: user.bio || '',
    dateOfBirth: user.dateOfBirth || '',
    country: user.country || '',
    city: user.city || '',
    timezone: user.timezone || '',
    preferredCurrency: user.preferredCurrency || 'USD'
  });

  // Address form state
  const [newAddress, setNewAddress] = useState<{
    type: 'HOME' | 'WORK' | 'OTHER';
    fullName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    additionalInfo: string;
  }>({
    type: 'HOME',
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    additionalInfo: ''
  });

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState<UserNotificationPreferences>(
    user.notificationPreferences || {
      email: true,
      sms: false,
      push: true,
      inApp: true,
      marketing: false,
      orderUpdates: true,
      gameUpdates: true,
      winnerAnnouncements: true,
      paymentNotifications: true,
      securityAlerts: true,
      weeklyDigest: false,
      newMessages: true,
      priceDrops: false,
      restockAlerts: false,
      deliveryUpdates: true
    }
  );

  const tabs = [
    { id: 'profile', label: t('profile.tabs.profile'), icon: User },
    { id: 'tickets', label: t('profile.tabs.tickets'), icon: Gamepad2 },
    { id: 'orders', label: t('profile.tabs.orders'), icon: Package },
    { id: 'addresses', label: t('profile.tabs.addresses'), icon: MapPin },
    { id: 'notifications', label: t('profile.tabs.notifications'), icon: Bell },
    { id: 'security', label: t('profile.tabs.security'), icon: Shield }
  ];

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      await onProfileUpdate(profileData);
      setIsEditing(false);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      toast.error(t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddressAdd = async () => {
    if (!newAddress.fullName || !newAddress.streetAddress || !newAddress.city) {
      toast.error(t('profile.address.requiredFields'));
      return;
    }

    const addressToAdd: Address = {
      id: Date.now().toString(),
      userId: user.id,
      ...newAddress,
      isDefault: addresses.length === 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      await onAddressUpdate([...addresses, addressToAdd]);
      setNewAddress({
        type: 'HOME',
        fullName: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        additionalInfo: ''
      });
      toast.success(t('profile.address.addSuccess'));
    } catch (error) {
      toast.error(t('profile.address.addError'));
    }
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    try {
      await onNotificationUpdate(notificationPrefs);
      toast.success(t('profile.notifications.updateSuccess'));
    } catch (error) {
      toast.error(t('profile.notifications.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('profile.personalInfo')}</CardTitle>
                <CardDescription>{t('profile.personalInfoDesc')}</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (isEditing) {
                    setProfileData({
                      firstName: user.firstName,
                      lastName: user.lastName,
                      phoneNumber: user.phoneNumber || '',
                      bio: user.bio || '',
                      dateOfBirth: user.dateOfBirth || '',
                      country: user.country || '',
                      city: user.city || '',
                      timezone: user.timezone || '',
                      preferredCurrency: user.preferredCurrency || 'USD'
                    });
                  }
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? t('common.cancel') : t('common.edit')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">{t('profile.phoneNumber')}</Label>
                  <Input
                    id="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">{t('profile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder={t('profile.bioPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">{t('profile.country')}</Label>
                  <Input
                    id="country"
                    value={profileData.country}
                    onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="city">{t('profile.city')}</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">{t('profile.dateOfBirth')}</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">{t('profile.timezone')}</Label>
                  <Select 
                    value={profileData.timezone} 
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectTimezone')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Africa/Douala">Africa/Douala (Cameroon)</SelectItem>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (Nigeria)</SelectItem>
                      <SelectItem value="Africa/Kinshasa">Africa/Kinshasa (DRC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">{t('profile.preferredCurrency')}</Label>
                  <Select 
                    value={profileData.preferredCurrency} 
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, preferredCurrency: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="XAF">XAF (Central African CFA)</SelectItem>
                      <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleProfileSave} disabled={loading}>
                    {loading ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'tickets':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.gameHistory')}</CardTitle>
              <CardDescription>{t('profile.gameHistoryDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <Gamepad2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('profile.noTickets')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('profile.noTicketsDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => {
                    const game = games.find(g => g.id === ticket.gameId);
                    const currentTime = Date.now();
                    const isExpired = ticket.expiresAt ? ticket.expiresAt < currentTime : false;
                    const canDownload = ticket.status === 'ACTIVE' && !isExpired;
                    
                    return (
                      <div key={ticket.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">
                              {game?.title || t('profile.unknownGame')}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t('profile.ticketNumber')}: {ticket.ticketNumber}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(ticket.purchaseDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={ticket.status === 'ACTIVE' ? 'default' : 'secondary'}
                              className={
                                ticket.status === 'ACTIVE' ? 'bg-green-500' :
                                ticket.status === 'EXPIRED' ? 'bg-red-500' : ''
                              }
                            >
                              {ticket.status}
                            </Badge>
                            {ticket.isWinner && (
                              <Badge className="bg-yellow-500 text-black">
                                {t('profile.winner')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">{t('profile.price')}: </span>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: ticket.currency
                              }).format(ticket.price)}
                            </p>
                            {ticket.isWinner && ticket.prizeAmount && (
                              <p className="text-sm text-green-600 dark:text-green-400">
                                <span className="font-medium">{t('profile.prize')}: </span>
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: ticket.currency
                                }).format(ticket.prizeAmount)}
                              </p>
                            )}
                            {ticket.expiresAt && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isExpired 
                                  ? t('profile.expired') 
                                  : `${t('profile.expires')}: ${new Date(ticket.expiresAt).toLocaleDateString()}`
                                }
                              </p>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {canDownload ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onTicketDownload(ticket.id)}
                                className="flex items-center space-x-1"
                              >
                                <Download className="h-4 w-4" />
                                <span>{t('profile.downloadTicket')}</span>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="flex items-center space-x-1 opacity-50"
                              >
                                <Clock className="h-4 w-4" />
                                <span>{t('profile.cannotDownload')}</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'orders':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.orderHistory')}</CardTitle>
              <CardDescription>{t('profile.orderHistoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('profile.noOrders')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('profile.noOrdersDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">Order #{order.orderNumber}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
                          className={order.status === 'DELIVERED' ? 'bg-green-500' : ''}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.productName} × {item.quantity}</span>
                            <span>${item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <span className="font-medium">Total: ${order.total}</span>
                        <Button variant="outline" size="sm">
                          {t('profile.viewOrder')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'addresses':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.shippingAddresses')}</CardTitle>
                <CardDescription>{t('profile.shippingAddressesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {t('profile.noAddresses')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('profile.noAddressesDesc')}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{address.fullName}</h4>
                              {address.isDefault && (
                                <Badge variant="secondary">{t('profile.default')}</Badge>
                              )}
                              <Badge variant="outline">{address.type}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {address.streetAddress}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {address.country}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {address.phoneNumber}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              {t('common.edit')}
                            </Button>
                            <Button variant="outline" size="sm">
                              {t('common.delete')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add New Address Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.addAddress')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                    <Input
                      id="fullName"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressPhone">{t('profile.phoneNumber')}</Label>
                    <Input
                      id="addressPhone"
                      value={newAddress.phoneNumber}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="streetAddress">{t('profile.streetAddress')}</Label>
                  <Input
                    id="streetAddress"
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, streetAddress: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="addressCity">{t('profile.city')}</Label>
                    <Input
                      id="addressCity"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">{t('profile.state')}</Label>
                    <Input
                      id="state"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">{t('profile.postalCode')}</Label>
                    <Input
                      id="postalCode"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addressCountry">{t('profile.country')}</Label>
                    <Input
                      id="addressCountry"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressType">{t('profile.addressType')}</Label>
                    <Select value={newAddress.type} onValueChange={(value: 'HOME' | 'WORK' | 'OTHER') => setNewAddress(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOME">{t('profile.home')}</SelectItem>
                        <SelectItem value="WORK">{t('profile.work')}</SelectItem>
                        <SelectItem value="OTHER">{t('profile.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="additionalInfo">{t('profile.additionalInfo')}</Label>
                  <Textarea
                    id="additionalInfo"
                    value={newAddress.additionalInfo}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder={t('profile.additionalInfoPlaceholder')}
                    rows={2}
                  />
                </div>

                <Button onClick={handleAddressAdd} className="w-full md:w-auto">
                  {t('profile.addAddress')}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.notificationSettings')}</CardTitle>
              <CardDescription>{t('profile.notificationSettingsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('profile.communicationChannels')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notif">{t('profile.emailNotifications')}</Label>
                    <Switch
                      id="email-notif"
                      checked={notificationPrefs.email}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notif">{t('profile.smsNotifications')}</Label>
                    <Switch
                      id="sms-notif"
                      checked={notificationPrefs.sms}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, sms: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notif">{t('profile.pushNotifications')}</Label>
                    <Switch
                      id="push-notif"
                      checked={notificationPrefs.push}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, push: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inapp-notif">{t('profile.inAppNotifications')}</Label>
                    <Switch
                      id="inapp-notif"
                      checked={notificationPrefs.inApp}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, inApp: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('profile.notificationTypes')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="order-updates">{t('profile.orderUpdates')}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.orderUpdatesDesc')}</p>
                    </div>
                    <Switch
                      id="order-updates"
                      checked={notificationPrefs.orderUpdates}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, orderUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="game-updates">{t('profile.gameUpdates')}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.gameUpdatesDesc')}</p>
                    </div>
                    <Switch
                      id="game-updates"
                      checked={notificationPrefs.gameUpdates}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, gameUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="winner-announcements">{t('profile.winnerAnnouncements')}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.winnerAnnouncementsDesc')}</p>
                    </div>
                    <Switch
                      id="winner-announcements"
                      checked={notificationPrefs.winnerAnnouncements}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, winnerAnnouncements: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="delivery-updates">{t('profile.deliveryUpdates')}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.deliveryUpdatesDesc')}</p>
                    </div>
                    <Switch
                      id="delivery-updates"
                      checked={notificationPrefs.deliveryUpdates}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, deliveryUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payment-notifications">{t('profile.paymentNotifications')}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.paymentNotificationsDesc')}</p>
                    </div>
                    <Switch
                      id="payment-notifications"
                      checked={notificationPrefs.paymentNotifications}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, paymentNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="security-alerts">{t('profile.securityAlerts')}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.securityAlertsDesc')}</p>
                    </div>
                    <Switch
                      id="security-alerts"
                      checked={notificationPrefs.securityAlerts}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, securityAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">{t('profile.marketingNotifications')}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.marketingNotificationsDesc')}</p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={notificationPrefs.marketing}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, marketing: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-digest">{t('profile.weeklyDigest')}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.weeklyDigestDesc')}</p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={notificationPrefs.weeklyDigest}
                      onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, weeklyDigest: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationSave} disabled={loading}>
                  {loading ? t('common.saving') : t('profile.saveNotifications')}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.securitySettings')}</CardTitle>
              <CardDescription>{t('profile.securitySettingsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('profile.accountSecurity')}</h3>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t('profile.emailVerification')}</span>
                    <Badge variant={user.emailVerified ? 'default' : 'secondary'} 
                           className={user.emailVerified ? 'bg-green-500' : ''}>
                      {user.emailVerified ? t('profile.verified') : t('profile.notVerified')}
                    </Badge>
                  </div>
                  {!user.emailVerified && (
                    <Button variant="outline" size="sm">
                      {t('profile.verifyEmail')}
                    </Button>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t('profile.phoneVerification')}</span>
                    <Badge variant={user.phoneVerified ? 'default' : 'secondary'}
                           className={user.phoneVerified ? 'bg-green-500' : ''}>
                      {user.phoneVerified ? t('profile.verified') : t('profile.notVerified')}
                    </Badge>
                  </div>
                  {!user.phoneVerified && (
                    <Button variant="outline" size="sm">
                      {t('profile.verifyPhone')}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('profile.changePassword')}</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('profile.enterCurrentPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('profile.enterNewPassword')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('profile.confirmNewPassword')}
                    />
                  </div>
                  
                  <Button>
                    {t('profile.updatePassword')}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400">{t('profile.dangerZone')}</h3>
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                    {t('profile.deleteAccount')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('profile.deleteAccountWarning')}
                  </p>
                  <Button variant="destructive">
                    {t('profile.deleteMyAccount')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};