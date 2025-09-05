'use client';

import EnhancedErrorBoundary from '@/components/performance/EnhancedErrorBoundary';
import {
  ContentSkeleton,
  PageLoading,
} from '@/components/performance/EnhancedLoading';
import OptimizedImage from '@/components/performance/OptimizedImage';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/lib/contexts/AuthContext';
import { realtimeService } from '@/lib/services/realtimeService';
import { ChatMessage } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Video,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Import API hooks
import { useShop } from '../api/queries';

interface ShopChatProps {
  shopId: string;
}

interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

const isDev = process.env.NODE_ENV === 'development';

// Memoized message component for performance
const MessageBubble = memo(
  ({
    message,
    isCurrentUser,
    userAvatar,
    t,
  }: {
    message: ChatMessage;
    isCurrentUser: boolean;
    userAvatar: string;
    t: any;
  }) => {
    return (
      <div
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`flex items-start gap-2 max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg ${
            isCurrentUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <OptimizedImage
            src={isCurrentUser ? userAvatar : '/default-shop-avatar.png'}
            alt={isCurrentUser ? t('chat.you') : t('chat.shopAssistant')}
            width={32}
            height={32}
            className='rounded-full flex-shrink-0 object-cover'
            sizes='32px'
            priority={false}
            lazy={true}
            placeholder='blur'
          />

          <div
            className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2 shadow-sm break-words ${
              isCurrentUser
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
            }`}
          >
            <p className='text-sm whitespace-pre-wrap break-words'>
              {message.message}
            </p>
            <div
              className={`flex items-center gap-1 mt-1 ${
                isCurrentUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <p
                className={`text-xs ${
                  isCurrentUser
                    ? 'text-orange-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {isCurrentUser && (
                <div className='ml-1'>
                  {message.status === 'sending' && (
                    <Circle className='w-3 h-3 text-orange-200 animate-pulse' />
                  )}
                  {message.status === 'sent' && (
                    <CheckCircle2 className='w-3 h-3 text-orange-200' />
                  )}
                  {message.status === 'error' && (
                    <AlertCircle className='w-3 h-3 text-red-300' />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = 'MessageBubble';

// Memoized typing indicator
const TypingIndicator = memo(() => {
  return (
    <div className='flex justify-start'>
      <div className='flex items-start gap-2 max-w-xs'>
        <OptimizedImage
          src='/default-shop-avatar.png'
          alt='Shop Assistant'
          width={32}
          height={32}
          className='rounded-full flex-shrink-0 object-cover'
          sizes='32px'
          priority={false}
          lazy={true}
          placeholder='blur'
        />

        <div className='bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='flex space-x-1'>
            <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
            <div
              className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

function ShopChatInner({ shopId }: ShopChatProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [shopTyping, setShopTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected'
  >('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingTime = useRef<number>(0);

  // API hooks
  const {
    data: shop,
    isLoading: shopLoading,
    error: shopError,
  } = useShop(shopId);

  // Chat messages query with real-time updates
  const { data: chatData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat', 'messages', shopId, user?.id],
    queryFn: async () => {
      if (isDev) {
        // Mock messages for development
        return {
          messages: [
            {
              id: 'msg-1',
              message: 'Hello! Welcome to our shop. How can I help you today?',
              senderId: 'shop-assistant',
              receiverId: user?.id || 'current-user',
              timestamp: Date.now() - 2 * 60 * 60 * 1000,
              read: true,
              type: 'text' as const,
              status: 'sent' as const,
            },
            {
              id: 'msg-2',
              message:
                "Hi! I'm interested in the latest products. What do you recommend?",
              senderId: user?.id || 'current-user',
              receiverId: 'shop-assistant',
              timestamp: Date.now() - 1 * 60 * 60 * 1000,
              read: true,
              type: 'text' as const,
              status: 'sent' as const,
            },
            {
              id: 'msg-3',
              message:
                "Great question! Based on your interests, I'd recommend checking out our featured products. They're very popular right now!",
              senderId: 'shop-assistant',
              receiverId: user?.id || 'current-user',
              timestamp: Date.now() - 30 * 60 * 1000,
              read: true,
              type: 'text' as const,
              status: 'sent' as const,
            },
          ] as ChatMessage[],
          hasMore: false,
        };
      }

      // Production API call
      const response = await fetch(
        `/api/chat/${shopId}/messages?userId=${user?.id}`
      );
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!user?.id && !!shopId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: isDev ? false : 5000, // Poll every 5 seconds in production
  });

  // Memoized messages for performance
  const messages = useMemo(
    () => chatData?.messages || [],
    [chatData?.messages]
  );

  // Send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; type: 'text' }) => {
      if (isDev) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          id: `msg-${Date.now()}`,
          ...messageData,
          senderId: user?.id || 'current-user',
          receiverId: 'shop-assistant',
          timestamp: Date.now(),
          read: false,
          status: 'sent' as const,
        };
      }

      const response = await fetch(`/api/chat/${shopId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageData,
          receiverId: 'shop-assistant',
          userId: user?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    // Optimistic update for instant UI feedback
    onMutate: async messageData => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['chat', 'messages', shopId, user?.id],
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData([
        'chat',
        'messages',
        shopId,
        user?.id,
      ]);

      // Create optimistic message
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        message: messageData.message,
        senderId: user?.id || 'current-user',
        receiverId: 'shop-assistant',
        timestamp: Date.now(),
        read: false,
        type: messageData.type,
        status: 'sending',
      };

      // Optimistically update to the new value
      queryClient.setQueryData(
        ['chat', 'messages', shopId, user?.id],
        (old: any) => ({
          ...old,
          messages: [...(old?.messages || []), optimisticMessage],
        })
      );

      return { previousData, optimisticMessage };
    },
    onError: (error, messageData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ['chat', 'messages', shopId, user?.id],
          context.previousData
        );
      }

      // Show error message with sanitized content
      const sanitizedMessage =
        messageData.message.length > 50
          ? `${messageData.message.substring(0, 50)}...`
          : messageData.message;
      toast.error(`${t('chat.sendError')}: "${sanitizedMessage}"`);
    },
    onSuccess: (newMessage, messageData, context) => {
      // Replace optimistic message with real one
      queryClient.setQueryData(
        ['chat', 'messages', shopId, user?.id],
        (old: any) => {
          const messages = old?.messages || [];
          const optimisticIndex = messages.findIndex(
            (msg: ChatMessage) => msg.id === context?.optimisticMessage?.id
          );

          if (optimisticIndex !== -1) {
            const updatedMessages = [...messages];
            updatedMessages[optimisticIndex] = newMessage;
            return { ...old, messages: updatedMessages };
          }

          return { ...old, messages: [...messages, newMessage] };
        }
      );

      // Simulate shop response in development
      if (isDev) {
        setTimeout(
          () => {
            const shopResponse: ChatMessage = {
              id: `msg-${Date.now()}-response`,
              message: t('chat.autoResponse', {
                productCount: Math.floor(Math.random() * 50) + 1,
                shopName: shop?.name || 'our shop',
              }),
              senderId: 'shop-assistant',
              receiverId: user?.id || 'current-user',
              timestamp: Date.now(),
              read: false,
              type: 'text',
              status: 'sent',
            };

            queryClient.setQueryData(
              ['chat', 'messages', shopId, user?.id],
              (old: any) => ({
                ...old,
                messages: [...(old?.messages || []), shopResponse],
              })
            );
          },
          1500 + Math.random() * 2000
        ); // Random response delay 1.5-3.5s
      }
    },
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // Real-time connection management
  useEffect(() => {
    if (!user?.id || !shopId) return;

    let unsubscribe: (() => void) | undefined;

    const setupRealtimeConnection = async () => {
      try {
        setConnectionStatus('connecting');

        if (isDev) {
          // Mock connection in development
          setConnectionStatus('connected');
          return;
        }

        // Production real-time setup
        unsubscribe = realtimeService.subscribeToUserMessages(
          user.id,
          (messages: ChatMessage[]) => {
            queryClient.setQueryData(
              ['chat', 'messages', shopId, user?.id],
              (old: any) => ({
                ...old,
                messages: messages,
              })
            );
          }
        );

        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to setup real-time connection:', error);
        setConnectionStatus('disconnected');
      }
    };

    setupRealtimeConnection();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, shopId, queryClient]);

  // Typing indicator logic
  const handleTyping = useCallback(() => {
    if (!user?.id || isDev) return; // Skip in development

    const now = Date.now();
    lastTypingTime.current = now;

    if (!isTyping) {
      setIsTyping(true);
      // Send typing start event
      // realtimeService.sendTypingIndicator(shopId, user.id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (Date.now() - lastTypingTime.current >= 1000) {
        setIsTyping(false);
        // realtimeService.sendTypingIndicator(shopId, user.id, false);
      }
    }, 1000);
  }, [user?.id, shopId, isTyping]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !user || sendMessageMutation.isPending) return;

    // Security: Sanitize and validate message
    const sanitizedMessage = message.trim();
    if (sanitizedMessage.length > 1000) {
      toast.error(t('chat.messageTooLong'));
      return;
    }

    // Clear input immediately for better UX
    const messageToSend = sanitizedMessage;
    setMessage('');

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      if (!isDev && user?.id) {
        // realtimeService.sendTypingIndicator(shopId, user.id, false);
      }
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send message with optimistic update
    sendMessageMutation.mutate({
      message: messageToSend,
      type: 'text',
    });

    // Focus back to input for continuous typing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [message, user, sendMessageMutation, isTyping, shopId, t]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setMessage(value);

      // Trigger typing indicator
      if (value.trim()) {
        handleTyping();
      } else if (isTyping) {
        setIsTyping(false);
        if (!isDev && user?.id) {
          // realtimeService.sendTypingIndicator(shopId, user.id, false);
        }
      }
    },
    [handleTyping, isTyping, user?.id, shopId]
  );

  // Memoize user avatar for performance
  const userAvatar = useMemo(
    () => user?.avatar || '/default-avatar.png',
    [user?.avatar]
  );

  // Connection status indicator
  const connectionStatusText = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return t('chat.connected');
      case 'connecting':
        return t('chat.connecting');
      case 'disconnected':
        return t('chat.disconnected');
      default:
        return t('chat.connecting');
    }
  }, [connectionStatus, t]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
            {t('auth.loginRequired')}
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-6'>
            {t('chat.loginRequiredDescription')}
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            {t('auth.login')}
          </Button>
        </div>
      </div>
    );
  }

  if (shopError) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>
            {t('error.shopNotFound')}
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-6'>
            {t('error.shopNotFoundDescription')}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            {t('common.goBack')}
          </Button>
        </div>
      </div>
    );
  }

  if (shopLoading || !shop) {
    return <PageLoading type='shop' />;
  }

  if (messagesLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col'>
        {/* Header */}
        <header className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3'>
          <ContentSkeleton type='shop-header' />
        </header>

        {/* Messages skeleton */}
        <div className='flex-1 overflow-y-auto p-4'>
          <ContentSkeleton type='chat-messages' count={8} />
        </div>

        {/* Input skeleton */}
        <div className='bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4'>
          <div className='flex items-end gap-3'>
            <div className='flex gap-2'>
              <div className='w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse' />
              <div className='w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse' />
            </div>
            <div className='flex-1 h-12 bg-gray-300 dark:bg-gray-600 rounded-2xl animate-pulse' />
            <div className='w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-2xl animate-pulse' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col'>
      {/* Header */}
      <header className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 sm:px-4 sm:py-3'>
        <div className='flex items-center justify-between min-h-[48px]'>
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <ArrowLeft className='w-5 h-5' />
            </Button>

            <div className='flex items-center gap-2 sm:gap-3'>
              <div className='relative flex-shrink-0'>
                <OptimizedImage
                  src={shop.logoUrl || '/default-shop-logo.png'}
                  alt={shop.name}
                  width={40}
                  height={40}
                  className='rounded-full object-cover'
                  sizes='40px'
                  priority={true}
                  lazy={false}
                  placeholder='blur'
                />
                <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800' />
              </div>

              <div className='min-w-0 flex-1'>
                <h1 className='font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate'>
                  {shop.name}
                </h1>
                <p
                  className={`text-sm flex items-center gap-1 ${
                    connectionStatus === 'connected'
                      ? 'text-green-600 dark:text-green-400'
                      : connectionStatus === 'connecting'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  <Circle
                    className={`w-3 h-3 ${
                      connectionStatus === 'connected'
                        ? 'fill-current'
                        : 'animate-pulse'
                    }`}
                  />
                  {connectionStatusText}
                </p>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-1 sm:gap-2'>
            <ThemeToggle />
            <Button variant='ghost' size='sm' className='hidden sm:flex'>
              <Phone className='w-4 h-4' />
            </Button>
            <Button variant='ghost' size='sm' className='hidden sm:flex'>
              <Video className='w-4 h-4' />
            </Button>
            <Button variant='ghost' size='sm'>
              <MoreVertical className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 pb-safe'>
        {messages.length === 0 && !messagesLoading ? (
          <div className='flex flex-col items-center justify-center h-full text-center py-12'>
            <div className='w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4'>
              <Send className='w-8 h-8 text-orange-500' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              {t('chat.startConversation')}
            </h3>
            <p className='text-gray-600 dark:text-gray-400 max-w-sm'>
              {t('chat.startConversationDescription', { shopName: shop?.name })}
            </p>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isCurrentUser = msg.senderId === (user?.id || 'current-user');

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isCurrentUser={isCurrentUser}
                userAvatar={userAvatar}
                t={t}
              />
            );
          })
        )}

        {shopTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 pb-safe'>
        <div className='flex items-end gap-2 sm:gap-3'>
          <div className='flex gap-1 sm:gap-2 flex-shrink-0'>
            <Button variant='ghost' size='sm' className='hidden sm:flex'>
              <Paperclip className='w-4 h-4' />
            </Button>
            <Button variant='ghost' size='sm' className='sm:hidden'>
              <Paperclip className='w-3 h-3' />
            </Button>
            <Button variant='ghost' size='sm' className='hidden sm:flex'>
              <ImageIcon className='w-4 h-4' />
            </Button>
          </div>

          <div className='flex-1 relative'>
            <input
              ref={inputRef}
              type='text'
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.typeMessage')}
              disabled={sendMessageMutation.isPending}
              maxLength={1000}
              className='w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed'
            />
            {isTyping && (
              <div className='absolute right-3 bottom-3'>
                <div className='flex space-x-1'>
                  <div className='w-1 h-1 bg-orange-500 rounded-full animate-bounce' />
                  <div
                    className='w-1 h-1 bg-orange-500 rounded-full animate-bounce'
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className='w-1 h-1 bg-orange-500 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className='px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl transition-colors'
          >
            {sendMessageMutation.isPending ? (
              <Circle className='w-4 h-4 animate-spin' />
            ) : (
              <Send className='w-4 h-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with error boundary
export function ShopChat({ shopId }: ShopChatProps) {
  return (
    <EnhancedErrorBoundary
      level='page'
      onError={(error, errorInfo, errorId) => {
        // TODO: Send to error monitoring service
        console.error('ShopChat Error:', { error, errorInfo, errorId });
      }}
    >
      <ShopChatInner shopId={shopId} />
    </EnhancedErrorBoundary>
  );
}
