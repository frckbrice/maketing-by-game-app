'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Shop, ChatMessage } from '@/types';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  Phone,
  Video,
  MoreVertical,
  Circle
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Import API hooks
import { useShop } from '../api/queries';

interface ShopChatProps {
  shopId: string;
}

export function ShopChat({ shopId }: ShopChatProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // API hooks
  const { data: shop, isLoading: shopLoading, error: shopError } = useShop(shopId);

  // Mock messages for demonstration
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      content: 'Hello! Welcome to our shop. How can I help you today?',
      senderId: 'shop-assistant',
      senderName: 'Shop Assistant',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=32&q=80',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      isRead: true,
      type: 'text'
    },
    {
      id: 'msg-2',
      content: 'Hi! I\'m interested in the iPhone 15 Pro Max. Is it still available?',
      senderId: user?.uid || 'current-user',
      senderName: user?.displayName || 'You',
      senderAvatar: user?.photoURL || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=32&q=80',
      timestamp: Date.now() - 1 * 60 * 60 * 1000,
      isRead: true,
      type: 'text'
    },
    {
      id: 'msg-3',
      content: 'Yes, we have it in stock! It\'s available in all colors. Which color would you prefer?',
      senderId: 'shop-assistant',
      senderName: 'Shop Assistant',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=32&q=80',
      timestamp: Date.now() - 30 * 60 * 1000,
      isRead: true,
      type: 'text'
    }
  ]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: message.trim(),
      senderId: user.uid || 'current-user',
      senderName: user.displayName || 'You',
      senderAvatar: user.photoURL || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=32&q=80',
      timestamp: Date.now(),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate shop response
    setTimeout(() => {
      const shopResponse: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        content: 'Thank you for your message! We\'ll get back to you shortly.',
        senderId: 'shop-assistant',
        senderName: 'Shop Assistant',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=32&q=80',
        timestamp: Date.now(),
        isRead: false,
        type: 'text'
      };
      setMessages(prev => [...prev, shopResponse]);
    }, 2000);
  }, [message, user]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('auth.loginRequired')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('error.shopNotFound')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('error.shopNotFoundDescription')}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.goBack')}
          </Button>
        </div>
      </div>
    );
  }

  if (shopLoading || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-300 dark:bg-gray-700 border-b" />
          <div className="flex-1 p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs rounded-2xl p-4 ${
                  i % 2 === 0 ? 'bg-gray-300 dark:bg-gray-700' : 'bg-gray-300 dark:bg-gray-700'
                }`}>
                  <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={shop.logo}
                  alt={shop.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              </div>
              
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  {shop.name}
                </h1>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Circle className="w-3 h-3 fill-current" />
                  {t('chat.online')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isCurrentUser = msg.senderId === (user?.uid || 'current-user');
          
          return (
            <div
              key={msg.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-xs sm:max-w-md ${
                isCurrentUser ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <Image
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
                
                <div className={`rounded-2xl px-4 py-2 ${
                  isCurrentUser
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    isCurrentUser
                      ? 'text-orange-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2 max-w-xs">
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=32&q=80"
                alt="Shop Assistant"
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
              />
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end gap-3">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.typeMessage')}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}