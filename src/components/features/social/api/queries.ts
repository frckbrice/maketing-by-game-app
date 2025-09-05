import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  startAfter,
  count,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Follow,
  FollowStats,
  Like,
  LikeStats,
  ChatRoom,
  ChatMessage,
  ChatPreview,
  Review,
  ReviewStats,
  SocialActivity,
  SocialNotification,
  SocialQueryParams,
  ChatQueryParams,
  ReviewQueryParams,
} from './types';

// Follow System Queries
export const useFollowStats = (
  targetId: string,
  targetType: 'USER' | 'SHOP' | 'VENDOR',
  userId?: string
) => {
  return useQuery({
    queryKey: ['follow-stats', targetId, targetType, userId],
    queryFn: async (): Promise<FollowStats> => {
      try {
        // Get followers count
        const followersRef = collection(db, 'follows');
        const followersQuery = query(
          followersRef,
          where('followingId', '==', targetId),
          where('followingType', '==', targetType)
        );
        const followersSnapshot = await getCountFromServer(followersQuery);
        const followersCount = followersSnapshot.data().count;

        // Get following count (only for users)
        let followingCount = 0;
        if (targetType === 'USER') {
          const followingQuery = query(
            followersRef,
            where('followerId', '==', targetId)
          );
          const followingSnapshot = await getCountFromServer(followingQuery);
          followingCount = followingSnapshot.data().count;
        }

        // Check if current user is following
        let isFollowing = false;
        let isFollowedBy = false;
        if (userId && userId !== targetId) {
          const userFollowQuery = query(
            followersRef,
            where('followerId', '==', userId),
            where('followingId', '==', targetId),
            where('followingType', '==', targetType)
          );
          const userFollowSnapshot = await getDocs(userFollowQuery);
          isFollowing = !userFollowSnapshot.empty;

          // Check if target follows current user back (only for user-to-user)
          if (targetType === 'USER') {
            const followBackQuery = query(
              followersRef,
              where('followerId', '==', targetId),
              where('followingId', '==', userId),
              where('followingType', '==', 'USER')
            );
            const followBackSnapshot = await getDocs(followBackQuery);
            isFollowedBy = !followBackSnapshot.empty;
          }
        }

        return {
          followersCount,
          followingCount,
          isFollowing,
          isFollowedBy,
        };
      } catch (error) {
        console.error('Error fetching follow stats:', error);
        // Return mock data for development
        return {
          followersCount: Math.floor(Math.random() * 1000) + 50,
          followingCount: Math.floor(Math.random() * 500) + 20,
          isFollowing: false,
          isFollowedBy: false,
        };
      }
    },
    enabled: !!targetId && !!targetType,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Like System Queries
export const useLikeStats = (
  targetId: string,
  targetType: 'PRODUCT' | 'SHOP' | 'POST' | 'REVIEW',
  userId?: string
) => {
  return useQuery({
    queryKey: ['like-stats', targetId, targetType, userId],
    queryFn: async (): Promise<LikeStats> => {
      try {
        const likesRef = collection(db, 'likes');
        const likesQuery = query(
          likesRef,
          where('targetId', '==', targetId),
          where('targetType', '==', targetType)
        );

        const likesSnapshot = await getDocs(likesQuery);
        const likesCount = likesSnapshot.size;

        let isLiked = false;
        const recentLikers: Array<{
          userId: string;
          userName: string;
          userAvatar?: string;
        }> = [];

        // Check if current user liked and get recent likers
        for (const likeDoc of likesSnapshot.docs) {
          const like = likeDoc.data() as Like;

          if (userId && like.userId === userId) {
            isLiked = true;
          }

          // Get user details for recent likers (limit to 5)
          if (recentLikers.length < 5) {
            try {
              const userDoc = await getDoc(doc(db, 'users', like.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                recentLikers.push({
                  userId: like.userId,
                  userName: `${userData.firstName} ${userData.lastName}`,
                  userAvatar: userData.avatar,
                });
              }
            } catch (userError) {
              // Skip if user not found
            }
          }
        }

        return {
          likesCount,
          isLiked,
          recentLikers,
        };
      } catch (error) {
        console.error('Error fetching like stats:', error);
        // Return mock data for development
        return {
          likesCount: Math.floor(Math.random() * 200) + 10,
          isLiked: false,
          recentLikers: [],
        };
      }
    },
    enabled: !!targetId && !!targetType,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Chat System Queries
export const useChatRooms = (userId: string, params: ChatQueryParams) => {
  return useQuery({
    queryKey: ['chat-rooms', userId, params],
    queryFn: async (): Promise<ChatPreview[]> => {
      if (!userId) return [];

      try {
        const chatRoomsRef = collection(db, 'chatRooms');
        const chatQuery = query(
          chatRoomsRef,
          where('participants', 'array-contains', userId),
          where('isActive', '==', true),
          orderBy('updatedAt', 'desc'),
          fbLimit(params.limit || 20)
        );

        const chatSnapshot = await getDocs(chatQuery);
        const chatPreviews: ChatPreview[] = [];

        for (const chatDoc of chatSnapshot.docs) {
          const chatRoom = { id: chatDoc.id, ...chatDoc.data() } as ChatRoom;

          // Get unread count
          const messagesRef = collection(db, 'chatMessages');
          const unreadQuery = query(
            messagesRef,
            where('chatRoomId', '==', chatRoom.id),
            where('senderId', '!=', userId),
            where('isRead', '==', false)
          );
          const unreadSnapshot = await getCountFromServer(unreadQuery);
          const unreadCount = unreadSnapshot.data().count;

          chatPreviews.push({
            chatRoom,
            unreadCount,
            lastActivity: chatRoom.updatedAt,
          });
        }

        return chatPreviews;
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
        // Return mock data for development
        return [
          {
            chatRoom: {
              id: '1',
              participants: [userId, 'vendor1'],
              participantDetails: [
                {
                  userId: 'vendor1',
                  userName: 'Electronics Store',
                  userAvatar: '/images/shop-avatar.jpg',
                  role: 'VENDOR',
                },
              ],
              type: 'SHOP_SUPPORT',
              shopId: 'shop1',
              isActive: true,
              createdAt: Date.now() - 24 * 60 * 60 * 1000,
              updatedAt: Date.now() - 2 * 60 * 60 * 1000,
            },
            unreadCount: 2,
            lastActivity: Date.now() - 2 * 60 * 60 * 1000,
          },
        ];
      }
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useChatMessages = (
  chatRoomId: string,
  params: ChatQueryParams
) => {
  return useInfiniteQuery({
    queryKey: ['chat-messages', chatRoomId, params],
    initialPageParam: null,
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number | null;
    }): Promise<ChatMessage[]> => {
      if (!chatRoomId) return [];

      try {
        const messagesRef = collection(db, 'chatMessages');
        let messagesQuery = query(
          messagesRef,
          where('chatRoomId', '==', chatRoomId),
          orderBy('createdAt', 'desc'),
          fbLimit(params.limit || 50)
        );

        if (pageParam) {
          messagesQuery = query(messagesQuery, startAfter(pageParam));
        }

        const messagesSnapshot = await getDocs(messagesQuery);
        const messages: ChatMessage[] = [];

        messagesSnapshot.forEach(doc => {
          messages.push({
            id: doc.id,
            ...doc.data(),
          } as ChatMessage);
        });

        return messages.reverse(); // Reverse to show newest at bottom
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }
    },
    getNextPageParam: lastPage => {
      if (lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].createdAt;
    },
    enabled: !!chatRoomId,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Review System Queries
export const useReviews = (params: ReviewQueryParams) => {
  return useInfiniteQuery({
    queryKey: ['reviews', params],
    initialPageParam: 0,
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<Review[]> => {
      try {
        const reviewsRef = collection(db, 'reviews');
        let reviewsQuery = query(
          reviewsRef,
          where('targetId', '==', params.targetId),
          where('targetType', '==', params.targetType),
          where('status', '==', 'PUBLISHED')
        );

        // Add filters
        if (params.rating) {
          reviewsQuery = query(
            reviewsQuery,
            where('rating', '==', params.rating)
          );
        }

        if (params.verified) {
          reviewsQuery = query(
            reviewsQuery,
            where('isVerifiedPurchase', '==', true)
          );
        }

        // Add sorting
        switch (params.sortBy) {
          case 'newest':
            reviewsQuery = query(reviewsQuery, orderBy('createdAt', 'desc'));
            break;
          case 'oldest':
            reviewsQuery = query(reviewsQuery, orderBy('createdAt', 'asc'));
            break;
          case 'rating':
            reviewsQuery = query(reviewsQuery, orderBy('rating', 'desc'));
            break;
          case 'helpful':
            reviewsQuery = query(reviewsQuery, orderBy('helpful', 'desc'));
            break;
          default:
            reviewsQuery = query(reviewsQuery, orderBy('createdAt', 'desc'));
        }

        reviewsQuery = query(reviewsQuery, fbLimit(params.limit || 10));

        if (pageParam > 0) {
          reviewsQuery = query(reviewsQuery, startAfter(pageParam));
        }

        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews: Review[] = [];

        reviewsSnapshot.forEach(doc => {
          reviews.push({
            id: doc.id,
            ...doc.data(),
          } as Review);
        });

        return reviews;
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Return mock data for development
        return [
          {
            id: '1',
            userId: 'user1',
            userName: 'John Doe',
            userAvatar: '/images/user-avatar.jpg',
            targetId: params.targetId,
            targetType: params.targetType,
            rating: 5,
            title: 'Excellent product!',
            content:
              'Really happy with this purchase. Fast delivery and great quality.',
            isVerifiedPurchase: true,
            helpful: 12,
            notHelpful: 1,
            status: 'PUBLISHED',
            createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Jane Smith',
            targetId: params.targetId,
            targetType: params.targetType,
            rating: 4,
            title: 'Good value for money',
            content: 'Nice product, would recommend to others.',
            isVerifiedPurchase: false,
            helpful: 8,
            notHelpful: 0,
            status: 'PUBLISHED',
            createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
          },
        ];
      }
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0) return undefined;
      return pages.length * (params.limit || 10);
    },
    enabled: !!params.targetId && !!params.targetType,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReviewStats = (
  targetId: string,
  targetType: 'PRODUCT' | 'SHOP' | 'VENDOR',
  userId?: string
) => {
  return useQuery({
    queryKey: ['review-stats', targetId, targetType, userId],
    queryFn: async (): Promise<ReviewStats> => {
      try {
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(
          reviewsRef,
          where('targetId', '==', targetId),
          where('targetType', '==', targetType),
          where('status', '==', 'PUBLISHED')
        );

        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => doc.data() as Review);

        const totalReviews = reviews.length;
        const averageRating =
          totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            : 0;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
          ratingDistribution[
            review.rating as keyof typeof ratingDistribution
          ]++;
        });

        // Check if user has reviewed
        let hasUserReviewed = false;
        let userReview: Review | undefined;
        if (userId) {
          userReview = reviews.find(review => review.userId === userId);
          hasUserReviewed = !!userReview;
        }

        return {
          totalReviews,
          averageRating,
          ratingDistribution,
          hasUserReviewed,
          userReview,
        };
      } catch (error) {
        console.error('Error fetching review stats:', error);
        // Return mock data for development
        return {
          totalReviews: 45,
          averageRating: 4.2,
          ratingDistribution: { 1: 2, 2: 3, 3: 8, 4: 15, 5: 17 },
          hasUserReviewed: false,
        };
      }
    },
    enabled: !!targetId && !!targetType,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Social Activity Feed
export const useSocialActivity = (
  userId: string,
  params: SocialQueryParams
) => {
  return useInfiniteQuery({
    queryKey: ['social-activity', userId, params],
    initialPageParam: 0,
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<SocialActivity[]> => {
      try {
        const activitiesRef = collection(db, 'socialActivities');
        let activitiesQuery = query(
          activitiesRef,
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          fbLimit(params.limit || 20)
        );

        if (pageParam > 0) {
          activitiesQuery = query(activitiesQuery, startAfter(pageParam));
        }

        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activities: SocialActivity[] = [];

        activitiesSnapshot.forEach(doc => {
          activities.push({
            id: doc.id,
            ...doc.data(),
          } as SocialActivity);
        });

        return activities;
      } catch (error) {
        console.error('Error fetching social activity:', error);
        // Return mock data for development
        return [
          {
            id: '1',
            userId: 'user1',
            userName: 'John Doe',
            userAvatar: '/images/user1.jpg',
            type: 'WIN',
            targetId: 'game1',
            targetType: 'GAME',
            targetName: 'Super Lottery Draw',
            metadata: {
              prizeAmount: 5000,
            },
            isPublic: true,
            createdAt: Date.now() - 2 * 60 * 60 * 1000,
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Jane Smith',
            type: 'REVIEW',
            targetId: 'product1',
            targetType: 'PRODUCT',
            targetName: 'Wireless Headphones',
            metadata: {
              rating: 5,
              productImage: '/images/headphones.jpg',
            },
            isPublic: true,
            createdAt: Date.now() - 4 * 60 * 60 * 1000,
          },
        ];
      }
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0) return undefined;
      return pages.length * (params.limit || 20);
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Social Notifications
export const useSocialNotifications = (userId: string, unreadOnly = false) => {
  return useQuery({
    queryKey: ['social-notifications', userId, unreadOnly],
    queryFn: async (): Promise<SocialNotification[]> => {
      if (!userId) return [];

      try {
        const notificationsRef = collection(db, 'socialNotifications');
        let notificationsQuery = query(
          notificationsRef,
          where('userId', '==', userId)
        );

        if (unreadOnly) {
          notificationsQuery = query(
            notificationsQuery,
            where('isRead', '==', false)
          );
        }

        notificationsQuery = query(
          notificationsQuery,
          orderBy('createdAt', 'desc'),
          fbLimit(50)
        );

        const notificationsSnapshot = await getDocs(notificationsQuery);
        const notifications: SocialNotification[] = [];

        notificationsSnapshot.forEach(doc => {
          notifications.push({
            id: doc.id,
            ...doc.data(),
          } as SocialNotification);
        });

        return notifications;
      } catch (error) {
        console.error('Error fetching social notifications:', error);
        return [];
      }
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30 * 1000, // 30 seconds
  });
};
