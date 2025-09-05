import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import {
  FollowRequest,
  LikeRequest,
  ChatMessageRequest,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewResponseRequest,
  ReviewVoteRequest,
  Follow,
  Like,
  ChatMessage,
  Review,
} from './types';

// Follow System Mutations
export const useFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      request,
    }: {
      userId: string;
      request: FollowRequest;
    }): Promise<void> => {
      try {
        const followsRef = collection(db, 'follows');

        // Check if already following
        const existingFollowQuery = query(
          followsRef,
          where('followerId', '==', userId),
          where('followingId', '==', request.targetId),
          where('followingType', '==', request.targetType)
        );

        const existingFollowSnapshot = await getDocs(existingFollowQuery);

        if (!existingFollowSnapshot.empty) {
          throw new Error('Already following this target');
        }

        // Create follow record
        const followData: Omit<Follow, 'id'> = {
          followerId: userId,
          followingId: request.targetId,
          followingType: request.targetType,
          createdAt: Date.now(),
        };

        await addDoc(followsRef, followData);

        // Create notification for the followed user/shop
        if (request.targetType === 'USER' || request.targetType === 'SHOP') {
          const notificationsRef = collection(db, 'socialNotifications');
          await addDoc(notificationsRef, {
            userId: request.targetId,
            type: 'NEW_FOLLOWER',
            title: 'New Follower',
            message: `Someone started following you`,
            actorId: userId,
            actorName: 'User', // This would be populated with actual user name
            isRead: false,
            createdAt: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error following target:', error);
        throw error;
      }
    },
    onSuccess: (_, { request }) => {
      // Invalidate follow stats
      queryClient.invalidateQueries({
        queryKey: ['follow-stats', request.targetId, request.targetType],
      });
      toast.success('Successfully followed!');
    },
    onError: (error: Error) => {
      console.error('Follow error:', error);
      toast.error(error.message || 'Failed to follow');
    },
  });
};

export const useUnfollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      request,
    }: {
      userId: string;
      request: FollowRequest;
    }): Promise<void> => {
      try {
        const followsRef = collection(db, 'follows');

        // Find existing follow record
        const existingFollowQuery = query(
          followsRef,
          where('followerId', '==', userId),
          where('followingId', '==', request.targetId),
          where('followingType', '==', request.targetType)
        );

        const existingFollowSnapshot = await getDocs(existingFollowQuery);

        if (existingFollowSnapshot.empty) {
          throw new Error('Not following this target');
        }

        // Delete follow record
        const followDoc = existingFollowSnapshot.docs[0];
        await deleteDoc(followDoc.ref);
      } catch (error) {
        console.error('Error unfollowing target:', error);
        throw error;
      }
    },
    onSuccess: (_, { request }) => {
      // Invalidate follow stats
      queryClient.invalidateQueries({
        queryKey: ['follow-stats', request.targetId, request.targetType],
      });
      toast.success('Successfully unfollowed!');
    },
    onError: (error: Error) => {
      console.error('Unfollow error:', error);
      toast.error(error.message || 'Failed to unfollow');
    },
  });
};

// Like System Mutations
export const useLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      request,
    }: {
      userId: string;
      request: LikeRequest;
    }): Promise<void> => {
      try {
        const likesRef = collection(db, 'likes');

        // Check if already liked
        const existingLikeQuery = query(
          likesRef,
          where('userId', '==', userId),
          where('targetId', '==', request.targetId),
          where('targetType', '==', request.targetType)
        );

        const existingLikeSnapshot = await getDocs(existingLikeQuery);

        if (!existingLikeSnapshot.empty) {
          throw new Error('Already liked this target');
        }

        // Create like record
        const likeData: Omit<Like, 'id'> = {
          userId,
          targetId: request.targetId,
          targetType: request.targetType,
          createdAt: Date.now(),
        };

        await addDoc(likesRef, likeData);

        // Update like count on target document if needed
        if (request.targetType === 'PRODUCT') {
          const productRef = doc(db, 'products', request.targetId);
          await updateDoc(productRef, {
            likeCount: increment(1),
          });
        }
      } catch (error) {
        console.error('Error liking target:', error);
        throw error;
      }
    },
    onSuccess: (_, { request }) => {
      // Invalidate like stats
      queryClient.invalidateQueries({
        queryKey: ['like-stats', request.targetId, request.targetType],
      });
    },
    onError: (error: Error) => {
      console.error('Like error:', error);
      toast.error(error.message || 'Failed to like');
    },
  });
};

export const useUnlike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      request,
    }: {
      userId: string;
      request: LikeRequest;
    }): Promise<void> => {
      try {
        const likesRef = collection(db, 'likes');

        // Find existing like record
        const existingLikeQuery = query(
          likesRef,
          where('userId', '==', userId),
          where('targetId', '==', request.targetId),
          where('targetType', '==', request.targetType)
        );

        const existingLikeSnapshot = await getDocs(existingLikeQuery);

        if (existingLikeSnapshot.empty) {
          throw new Error('Not liked this target');
        }

        // Delete like record
        const likeDoc = existingLikeSnapshot.docs[0];
        await deleteDoc(likeDoc.ref);

        // Update like count on target document if needed
        if (request.targetType === 'PRODUCT') {
          const productRef = doc(db, 'products', request.targetId);
          await updateDoc(productRef, {
            likeCount: increment(-1),
          });
        }
      } catch (error) {
        console.error('Error unliking target:', error);
        throw error;
      }
    },
    onSuccess: (_, { request }) => {
      // Invalidate like stats
      queryClient.invalidateQueries({
        queryKey: ['like-stats', request.targetId, request.targetType],
      });
    },
    onError: (error: Error) => {
      console.error('Unlike error:', error);
      toast.error(error.message || 'Failed to unlike');
    },
  });
};

// Chat System Mutations
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userName,
      request,
    }: {
      userId: string;
      userName: string;
      request: ChatMessageRequest;
    }): Promise<ChatMessage> => {
      try {
        const messagesRef = collection(db, 'chatMessages');

        const messageData: Omit<ChatMessage, 'id'> = {
          chatRoomId: request.chatRoomId,
          senderId: userId,
          senderName: userName,
          message: request.message,
          type: request.type,
          metadata: request.metadata,
          isRead: false,
          readBy: [],
          createdAt: Date.now(),
          isEdited: false,
        };

        const messageDoc = await addDoc(messagesRef, messageData);

        // Update chat room's last message and timestamp
        const chatRoomRef = doc(db, 'chatRooms', request.chatRoomId);
        await updateDoc(chatRoomRef, {
          lastMessage: {
            id: messageDoc.id,
            message: request.message,
            senderId: userId,
            senderName: userName,
            createdAt: Date.now(),
          },
          updatedAt: Date.now(),
        });

        return {
          id: messageDoc.id,
          ...messageData,
        };
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    onSuccess: newMessage => {
      // Invalidate chat queries
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', newMessage.chatRoomId],
      });
    },
    onError: (error: Error) => {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    },
  });
};

// Review System Mutations
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userName,
      userAvatar,
      request,
    }: {
      userId: string;
      userName: string;
      userAvatar?: string;
      request: CreateReviewRequest;
    }): Promise<Review> => {
      try {
        // Check if user already reviewed this target
        const reviewsRef = collection(db, 'reviews');
        const existingReviewQuery = query(
          reviewsRef,
          where('userId', '==', userId),
          where('targetId', '==', request.targetId),
          where('targetType', '==', request.targetType)
        );

        const existingReviewSnapshot = await getDocs(existingReviewQuery);

        if (!existingReviewSnapshot.empty) {
          throw new Error('You have already reviewed this item');
        }

        // Create review
        const reviewData: Omit<Review, 'id'> = {
          userId,
          userName,
          userAvatar,
          targetId: request.targetId,
          targetType: request.targetType,
          rating: request.rating,
          title: request.title,
          content: request.content,
          images: request.images,
          isVerifiedPurchase: false, // This would be determined by checking purchase history
          helpful: 0,
          notHelpful: 0,
          status: 'PENDING', // Reviews start as pending for moderation
          createdAt: Date.now(),
        };

        const reviewDoc = await addDoc(reviewsRef, reviewData);

        // Create social activity
        const activitiesRef = collection(db, 'socialActivities');
        await addDoc(activitiesRef, {
          userId,
          userName,
          userAvatar,
          type: 'REVIEW',
          targetId: request.targetId,
          targetType: request.targetType,
          targetName: '', // This would be populated with actual target name
          metadata: {
            rating: request.rating,
          },
          isPublic: true,
          createdAt: Date.now(),
        });

        return {
          id: reviewDoc.id,
          ...reviewData,
        };
      } catch (error) {
        console.error('Error creating review:', error);
        throw error;
      }
    },
    onSuccess: (_, { request }) => {
      // Invalidate review queries
      queryClient.invalidateQueries({
        queryKey: ['reviews', request.targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['review-stats', request.targetId],
      });
      toast.success('Review submitted successfully!');
    },
    onError: (error: Error) => {
      console.error('Create review error:', error);
      toast.error(error.message || 'Failed to submit review');
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      request,
    }: {
      userId: string;
      request: UpdateReviewRequest;
    }): Promise<void> => {
      try {
        const reviewRef = doc(db, 'reviews', request.reviewId);

        const updateData: any = {
          updatedAt: Date.now(),
        };

        if (request.rating !== undefined) updateData.rating = request.rating;
        if (request.title !== undefined) updateData.title = request.title;
        if (request.content !== undefined) updateData.content = request.content;
        if (request.images !== undefined) updateData.images = request.images;

        await updateDoc(reviewRef, updateData);
      } catch (error) {
        console.error('Error updating review:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate review queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success('Review updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Update review error:', error);
      toast.error('Failed to update review');
    },
  });
};

export const useVoteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      request,
    }: {
      userId: string;
      request: ReviewVoteRequest;
    }): Promise<void> => {
      try {
        const reviewRef = doc(db, 'reviews', request.reviewId);

        // This is a simplified implementation
        // In a real app, you'd track user votes to prevent duplicate voting
        const incrementField =
          request.vote === 'HELPFUL' ? 'helpful' : 'notHelpful';

        await updateDoc(reviewRef, {
          [incrementField]: increment(1),
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error('Error voting on review:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate review queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Thank you for your feedback!');
    },
    onError: (error: Error) => {
      console.error('Vote review error:', error);
      toast.error('Failed to vote on review');
    },
  });
};

// Mark notifications as read
export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      notificationIds,
    }: {
      userId: string;
      notificationIds: string[];
    }): Promise<void> => {
      try {
        const updatePromises = notificationIds.map(notificationId => {
          const notificationRef = doc(
            db,
            'socialNotifications',
            notificationId
          );
          return updateDoc(notificationRef, {
            isRead: true,
          });
        });

        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
        throw error;
      }
    },
    onSuccess: (_, { userId }) => {
      // Invalidate notifications
      queryClient.invalidateQueries({
        queryKey: ['social-notifications', userId],
      });
    },
    onError: (error: Error) => {
      console.error('Mark notifications read error:', error);
    },
  });
};
