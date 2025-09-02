'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, MoreHorizontal, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useVoteReview } from '../api/mutations';
import { useTranslation } from 'react-i18next';
import { Review } from '../api/types';
import { toast } from 'sonner';

interface ReviewCardProps {
  review: Review;
  showTargetInfo?: boolean;
  onReply?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showTargetInfo = false,
  onReply,
  onReport,
  className = ''
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showFullContent, setShowFullContent] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const voteReviewMutation = useVoteReview();

  const handleVote = async (vote: 'HELPFUL' | 'NOT_HELPFUL') => {
    if (!user) {
      toast.error(t('auth.pleaseLogin'));
      return;
    }

    try {
      await voteReviewMutation.mutateAsync({
        userId: user.id,
        request: { reviewId: review.id, vote }
      });
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        return t('social.justNow');
      }
      return t('social.hoursAgo', { hours: Math.floor(diffInHours) });
    } else if (diffInHours < 24 * 7) {
      return t('social.daysAgo', { days: Math.floor(diffInHours / 24) });
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const shouldTruncateContent = review.content.length > 200;
  const displayContent = shouldTruncateContent && !showFullContent 
    ? review.content.slice(0, 200) + '...'
    : review.content;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              {review.userAvatar && (
                <AvatarImage src={review.userAvatar} alt={review.userName} />
              )}
              <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                {review.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {review.userName}
                </h4>
                {review.isVerifiedPurchase && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <span className="text-xs">{t('social.verified')}</span>
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 py-1 min-w-[120px]">
                {onReport && (
                  <button
                    onClick={() => {
                      onReport(review.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Flag className="w-4 h-4" />
                    <span>{t('social.report')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Review Title */}
        {review.title && (
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            {review.title}
          </h3>
        )}

        {/* Review Content */}
        <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
          {displayContent}
        </p>

        {shouldTruncateContent && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline mb-3"
          >
            {showFullContent ? t('social.showLess') : t('social.readMore')}
          </button>
        )}

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {review.images.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        )}

        {/* Vendor Response */}
        {review.response && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline">
                {t('social.vendorResponse')}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(review.response.respondedAt)}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {review.response.content}
            </p>
          </div>
        )}

        {/* Review Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Helpful votes */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('HELPFUL')}
                disabled={voteReviewMutation.isLoading || !user}
                className={`p-2 ${review.userVote === 'HELPFUL' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'} hover:text-green-600 dark:hover:text-green-400`}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              {review.helpful > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {review.helpful}
                </span>
              )}
            </div>

            {/* Not helpful votes */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('NOT_HELPFUL')}
                disabled={voteReviewMutation.isLoading || !user}
                className={`p-2 ${review.userVote === 'NOT_HELPFUL' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'} hover:text-red-600 dark:hover:text-red-400`}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
              {review.notHelpful > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {review.notHelpful}
                </span>
              )}
            </div>

            {/* Reply button */}
            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(review.id)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Review status indicator */}
          {review.status !== 'PUBLISHED' && (
            <Badge variant="outline" className="text-xs">
              {review.status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};