export interface PaymentNotification {
  userId: string;
  type:
    | 'payment_success'
    | 'payment_failed'
    | 'payment_timeout'
    | 'payment_cancelled';
  transactionId?: string;
  gameId?: string;
  amount?: number;
  currency?: string;
  gameTitle?: string;
  ticketId?: string;
  message?: string;
}

class PaymentNotificationService {
  async sendPaymentNotification(
    notification: PaymentNotification
  ): Promise<void> {
    try {
      // In a real application, this would send notifications via:
      // - Push notifications
      // - Email
      // - SMS
      // - In-app notifications

      console.log('Payment notification:', notification);

      // For now, just log the notification
      // In production, you would integrate with your notification service
    } catch (error) {
      console.error('Failed to send payment notification:', error);
      // Don't throw error to avoid breaking the payment flow
    }
  }
}

export const paymentNotificationService = new PaymentNotificationService();
