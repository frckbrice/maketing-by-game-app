'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLikeStats } from '../api/queries';
import { useLike, useUnlike } from '../api/mutations';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface LikeButtonProps {
  targetId: string;
  targetType: 'PRODUCT' | 'SHOP' | 'POST' | 'REVIEW';
  variant?: 'default' | 'icon' | 'compact';
  showCount?: boolean;
  showRecentLikers?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  targetId,
  targetType,
  variant = 'default',
  showCount = true,
  showRecentLikers = false,
  className = '',
  size = 'default'
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const { data: likeStats, isLoading } = useLikeStats(
    targetId,
    targetType,
    user?.id
  );
  
  const likeMutation = useLike();
  const unlikeMutation = useUnlike();

  const isLiked = likeStats?.isLiked || false;
  const likesCount = likeStats?.likesCount || 0;
  const recentLikers = likeStats?.recentLikers || [];
  const isLoading_mutation = likeMutation.isLoading || unlikeMutation.isLoading;

  const handleLikeToggle = async () => {
    if (!user) {
      toast.error(t('auth.pleaseLogin'));
      return;
    }

    try {
      const request = { targetId, targetType };
      
      if (isLiked) {
        await unlikeMutation.mutateAsync({ userId: user.id, request });
      } else {
        await likeMutation.mutateAsync({ userId: user.id, request });
      }
    } catch (error) {
      // Error already handled in mutations
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  const getButtonClasses = () => {
    let classes = `${className} transition-all duration-200`;
    
    if (variant === 'icon') {
      classes += ` w-${size === 'sm' ? '8' : size === 'lg' ? '12' : '10'} h-${size === 'sm' ? '8' : size === 'lg' ? '12' : '10'} rounded-full flex items-center justify-center`;
      
      if (isLiked) {
        classes += ' bg-red-500 text-white hover:bg-red-600 shadow-lg transform hover:scale-110';
      } else {
        classes += ' bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white border border-gray-200 hover:border-red-500 hover:scale-110';
      }
    } else {
      if (isLiked) {
        classes += ' text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300';
      } else {
        classes += ' text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400';
      }
    }
    
    return classes;
  };

  const formatLikesCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${variant === 'icon' ? 'w-8 h-8' : 'w-12 h-6'}`} />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={variant === 'icon' ? 'ghost' : 'ghost'}
        size={size}
        onClick={handleLikeToggle}
        disabled={isLoading_mutation}
        className={getButtonClasses()}
        title={isLiked ? t('social.unlike') : t('social.like')}
      >
        {isLoading_mutation ? (
          <div className={`border-2 border-current border-t-transparent rounded-full animate-spin ${getIconSize()}`} />
        ) : (
          <Heart 
            className={`${getIconSize()} ${isLiked ? 'fill-current' : ''} ${variant !== 'icon' ? 'mr-2' : ''}`}
          />
        )}
        
        {variant !== 'icon' && showCount && likesCount > 0 && (
          <span className="font-medium">
            {formatLikesCount(likesCount)}
          </span>
        )}
      </Button>

      {/* Show count separately for icon variant */}
      {variant === 'icon' && showCount && likesCount > 0 && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {formatLikesCount(likesCount)}
        </span>
      )}

      {/* Recent likers preview */}
      {showRecentLikers && recentLikers.length > 0 && (
        <div className="flex items-center space-x-1">
          <div className="flex -space-x-2">
            {recentLikers.slice(0, 3).map((liker, index) => (
              <div
                key={liker.userId}
                className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900 overflow-hidden"
                style={{ zIndex: 3 - index }}
                title={liker.userName}
              >
                {liker.userAvatar ? (
                  <img 
                    src={liker.userAvatar} 
                    alt={liker.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs text-white font-bold">
                    {liker.userName.charAt(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {recentLikers.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{recentLikers.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};