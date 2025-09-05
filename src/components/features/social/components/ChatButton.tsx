'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ChatButtonProps {
  targetId: string;
  targetType: 'USER' | 'SHOP' | 'VENDOR';
  targetName: string;
  variant?: 'default' | 'icon' | 'compact';
  className?: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  targetId,
  targetType,
  targetName,
  variant = 'default',
  className = '',
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  // Don't show chat button for self
  if (user?.id === targetId) {
    return null;
  }

  const handleStartChat = async () => {
    if (!user) {
      toast.error(t('auth.pleaseLogin'));
      return;
    }

    try {
      // In a real implementation, this would:
      // 1. Check if chat room already exists
      // 2. Create new chat room if it doesn't exist
      // 3. Navigate to chat interface

      // For now, we'll simulate this
      const chatRoomId = `${user.id}_${targetId}`;

      // Navigate to chat page
      router.push(
        `/chat/${chatRoomId}?target=${targetName}&type=${targetType}`
      );

      toast.success(t('social.chatStarted'));
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(t('social.chatError'));
    }
  };

  const getButtonText = () => {
    if (variant === 'icon') return null;

    switch (targetType) {
      case 'SHOP':
        return variant === 'compact'
          ? t('social.chat')
          : t('social.contactShop');
      case 'VENDOR':
        return variant === 'compact'
          ? t('social.chat')
          : t('social.contactVendor');
      case 'USER':
        return variant === 'compact'
          ? t('social.message')
          : t('social.sendMessage');
      default:
        return t('social.chat');
    }
  };

  const getIcon = () => {
    return targetType === 'SHOP' || targetType === 'VENDOR' ? (
      <MessageCircle
        className={`${variant === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`}
      />
    ) : (
      <Send className={`${variant === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`} />
    );
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'icon':
        return 'outline';
      case 'compact':
        return 'outline';
      default:
        return 'default';
    }
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
    let classes = `${className} transition-all duration-200`;

    if (variant === 'icon') {
      classes += ' w-10 h-10 rounded-full flex items-center justify-center';
    }

    // Color scheme based on target type
    if (targetType === 'SHOP' || targetType === 'VENDOR') {
      classes +=
        ' text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20';
    } else {
      classes +=
        ' text-purple-600 border-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900/20';
    }

    return classes;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={getButtonSize()}
      onClick={handleStartChat}
      className={getButtonClasses()}
      title={`${t('social.startChatWith')} ${targetName}`}
    >
      {getIcon()}
      {getButtonText()}
    </Button>
  );
};
