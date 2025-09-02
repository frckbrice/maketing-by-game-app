'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useGamificationQueries, useGamificationMutations } from '../api';
import { Share2, Users, Gift, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export const ReferralSystem: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { referral } = useGamificationQueries(user?.id);
  const { generateReferralCode, applyReferral } = useGamificationMutations(user?.id);
  
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: referralResponse, isLoading } = referral;
  const referralProfile = referralResponse?.profile;

  const handleGenerateCode = () => {
    generateReferralCode.mutate({ action: 'generate_code' });
  };

  const handleApplyReferral = () => {
    if (referralCodeInput.trim()) {
      applyReferral.mutate({
        action: 'apply_referral',
        referralCode: referralCodeInput.trim(),
      });
      setReferralCodeInput('');
    }
  };

  const handleCopyCode = async () => {
    if (referralProfile?.personalReferralCode) {
      try {
        await navigator.clipboard.writeText(referralProfile.personalReferralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy referral code:', err);
      }
    }
  };

  if (!user || isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{t('gamification.referral.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referralProfile ? (
            <div className="space-y-6">
              {/* Personal Referral Code */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('gamification.referral.yourCode')}</h3>
                  {!referralProfile.personalReferralCode && (
                    <Button
                      onClick={handleGenerateCode}
                      disabled={generateReferralCode.isPending}
                      size="sm"
                    >
                      {generateReferralCode.isPending ? t('common.generating') : t('gamification.referral.generateCode')}
                    </Button>
                  )}
                </div>

                {referralProfile.personalReferralCode && (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-lg text-center">
                      {referralProfile.personalReferralCode}
                    </div>
                    <Button
                      onClick={handleCopyCode}
                      variant="outline"
                      size="sm"
                      className="p-3"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('gamification.referral.codeDescription')}
                </p>
              </div>

              {/* Share Options */}
              {referralProfile.personalReferralCode && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">{t('gamification.referral.shareCode')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/register?ref=${referralProfile.personalReferralCode}`;
                        if (navigator.share) {
                          navigator.share({
                            title: t('gamification.referral.shareTitle'),
                            text: t('gamification.referral.shareText'),
                            url: shareUrl,
                          });
                        } else {
                          navigator.clipboard.writeText(shareUrl);
                        }
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{t('common.share')}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{referralProfile.totalReferrals}</div>
                  <div className="text-sm text-blue-600">{t('gamification.referral.totalReferrals')}</div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{referralProfile.successfulReferrals}</div>
                  <div className="text-sm text-green-600">{t('gamification.referral.successful')}</div>
                </div>

                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{referralProfile.pendingReferrals}</div>
                  <div className="text-sm text-yellow-600">{t('gamification.referral.pending')}</div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{referralProfile.totalRewardsEarned}</div>
                  <div className="text-sm text-purple-600">{t('gamification.referral.rewards')}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Gift className="w-16 h-16 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('gamification.referral.getStarted')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('gamification.referral.getStartedDescription')}
                </p>
                <Button
                  onClick={handleGenerateCode}
                  disabled={generateReferralCode.isPending}
                  className="flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>{generateReferralCode.isPending ? t('common.generating') : t('gamification.referral.generateCode')}</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle>{t('gamification.referral.applyCode')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('gamification.referral.applyCodeDescription')}
            </p>
            
            <div className="flex space-x-2">
              <Input
                placeholder={t('gamification.referral.enterCode')}
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleApplyReferral}
                disabled={!referralCodeInput.trim() || applyReferral.isPending}
              >
                {applyReferral.isPending ? t('common.applying') : t('common.apply')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>{t('gamification.referral.howItWorks')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge className="mt-1">1</Badge>
              <div>
                <h4 className="font-medium">{t('gamification.referral.step1Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('gamification.referral.step1Description')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="mt-1">2</Badge>
              <div>
                <h4 className="font-medium">{t('gamification.referral.step2Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('gamification.referral.step2Description')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="mt-1">3</Badge>
              <div>
                <h4 className="font-medium">{t('gamification.referral.step3Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('gamification.referral.step3Description')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};