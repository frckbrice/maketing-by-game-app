'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Heart, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFollowStats } from '../api/queries';
import { useFollow, useUnfollow } from '../api/mutations';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface FollowButtonProps {
  targetId: string;
  targetType: 'USER' | 'SHOP' | 'VENDOR';
  targetName?: string;
  variant?: 'default' | 'icon' | 'compact';
  showCount?: boolean;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetId,
  targetType,
  targetName,
  variant = 'default',
  showCount = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const { data: followStats, isLoading } = useFollowStats(
    targetId,
    targetType,
    user?.id
  );
  
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  // Don't show follow button for self
  if (user?.id === targetId) {
    return null;
  }

  // Don't show if not authenticated
  if (!user) {
    return null;
  }

  const isFollowing = followStats?.isFollowing || false;
  const followersCount = followStats?.followersCount || 0;
  const isLoading_mutation = followMutation.isLoading || unfollowMutation.isLoading;

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error(t('auth.pleaseLogin'));
      return;
    }

    try {
      const request = { targetId, targetType };
      
      if (isFollowing) {
        await unfollowMutation.mutateAsync({ userId: user.id, request });
      } else {
        await followMutation.mutateAsync({ userId: user.id, request });
      }
    } catch (error) {
      // Error already handled in mutations
    }
  };

  const getButtonText = () => {
    if (variant === 'icon') return null;
    
    if (isFollowing) {
      return variant === 'compact' ? t('social.following') : t('social.following');
    }
    
    switch (targetType) {
      case 'SHOP':
        return variant === 'compact' ? t('social.follow') : t('social.followShop');
      case 'USER':
        return variant === 'compact' ? t('social.follow') : t('social.followUser');
      case 'VENDOR':
        return variant === 'compact' ? t('social.follow') : t('social.followVendor');
      default:
        return t('social.follow');
    }
  };

  const getIcon = () => {
    if (targetType === 'SHOP') {
      return <Heart className={`${variant === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'} ${isFollowing ? 'fill-current' : ''}`} />;
    }
    
    return isFollowing 
      ? <UserCheck className={`${variant === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`} />
      : <UserPlus className={`${variant === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`} />;
  };

  const getButtonVariant = () => {
    if (variant === 'icon') {
      return isFollowing ? 'default' : 'outline';
    }
    
    return isFollowing ? 'outline' : 'default';
  };

  const getButtonSize = () => {
    switch (variant) {
      case 'icon':
        return 'sm';
      case 'compact':
        return 'sm';
      default:
        return 'default';
    }
  };

  const getButtonClasses = () => {
    let classes = className;
    
    if (isFollowing) {
      if (targetType === 'SHOP') {
        classes += ' text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20';
      } else {
        classes += ' text-purple-600 border-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900/20';
      }
    } else {
      if (targetType === 'SHOP') {
        classes += ' bg-red-600 hover:bg-red-700 text-white border-red-600';
      } else {
        classes += ' bg-purple-600 hover:bg-purple-700 text-white border-purple-600';
      }
    }
    
    return classes;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${variant === 'icon' ? '' : 'w-20'}`} />
        {showCount && <span className="text-sm text-gray-500">...</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={getButtonVariant()}
        size={getButtonSize()}
        onClick={handleFollowToggle}
        disabled={isLoading_mutation}
        className={getButtonClasses()}
        title={`${isFollowing ? t('social.unfollow') : t('social.follow')} ${targetName || ''}`}
      >
        {isLoading_mutation ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {getIcon()}
            {getButtonText()}
          </>
        )}
      </Button>
      
      {showCount && followersCount > 0 && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {followersCount.toLocaleString()} {t('social.followers')}
        </span>
      )}
    </div>
  );
};