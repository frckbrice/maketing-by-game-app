// Client-side payment polling service

import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { PaymentStatus } from './securePaymentService';

interface PollingConfig {
  maxAttempts?: number;
  intervalMs?: number;
  timeoutMs?: number;
}

interface PaymentStatusUpdate {
  status: PaymentStatus;
  updatedAt: Date;
  nokashData?: any;
}

class PaymentPollingService {
  private activePolls: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start polling for payment status updates
   */
  async startPolling(
    paymentId: string,
    config: PollingConfig = {}
  ): Promise<void> {
    const {
      maxAttempts = 60, // 10 minutes with 10s intervals
      intervalMs = 10000, // 10 seconds
      timeoutMs = 600000, // 10 minutes total timeout
    } = config;

    // Clear any existing polling for this payment
    this.stopPolling(paymentId);

    let attempts = 0;
    const startTime = Date.now();

    const poll = async () => {
      try {
        attempts++;

        // Check if we've exceeded max attempts or timeout
        if (attempts > maxAttempts || Date.now() - startTime > timeoutMs) {
          console.log(
            `Polling timeout for payment ${paymentId} after ${attempts} attempts`
          );
          this.stopPolling(paymentId);

          // Mark payment as expired
          await this.updatePaymentStatus(paymentId, {
            status: 'EXPIRED',
            updatedAt: new Date(),
          });
          return;
        }

        // Check current payment status
        const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
        if (!paymentDoc.exists()) {
          console.warn(`Payment ${paymentId} not found during polling`);
          this.stopPolling(paymentId);
          return;
        }

        const paymentData = paymentDoc.data();
        const currentStatus = paymentData.status;

        // Stop polling if payment is in final state
        if (
          ['SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(currentStatus)
        ) {
          console.log(
            `Payment ${paymentId} reached final status: ${currentStatus}`
          );
          this.stopPolling(paymentId);
          return;
        }

        // Check with NOKASH API if we have a transaction ID
        if (paymentData.nokashTransactionId) {
          const statusCheck = await this.checkNokashStatus(
            paymentData.nokashTransactionId
          );

          if (statusCheck.success && statusCheck.status !== currentStatus) {
            await this.updatePaymentStatus(paymentId, {
              status: statusCheck.status as
                | 'SUCCESS'
                | 'FAILED'
                | 'CANCELLED'
                | 'EXPIRED'
                | 'PENDING',
              updatedAt: new Date(),
              nokashData: statusCheck.data,
            });

            // Stop polling if reached final state
            if (
              ['SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(
                statusCheck.status
              )
            ) {
              this.stopPolling(paymentId);
              return;
            }
          }
        }

        // Schedule next poll
        const timeoutId = setTimeout(poll, intervalMs);
        this.activePolls.set(paymentId, timeoutId);
      } catch (error) {
        console.error(`Error during payment polling for ${paymentId}:`, error);

        // Continue polling on error, but log it
        const timeoutId = setTimeout(poll, intervalMs);
        this.activePolls.set(paymentId, timeoutId);
      }
    };

    // Start initial poll
    poll();
  }

  /**
   * Stop polling for a specific payment
   */
  stopPolling(paymentId: string): void {
    const timeoutId = this.activePolls.get(paymentId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activePolls.delete(paymentId);
      console.log(`Stopped polling for payment ${paymentId}`);
    }
  }

  /**
   * Stop all active polling
   */
  stopAllPolling(): void {
    for (const [paymentId, timeoutId] of this.activePolls) {
      clearTimeout(timeoutId);
      console.log(`Stopped polling for payment ${paymentId}`);
    }
    this.activePolls.clear();
  }

  /**
   * Get active polling count
   */
  getActiveCount(): number {
    return this.activePolls.size;
  }

  /**
   * Check if payment is being polled
   */
  isPolling(paymentId: string): boolean {
    return this.activePolls.has(paymentId);
  }

  /**
   * Check payment status with NOKASH API
   */
  private async checkNokashStatus(nokashTransactionId: string): Promise<{
    success: boolean;
    status: string;
    data?: any;
  }> {
    try {
      // This would typically call the NOKASH status API
      // For now, we'll use a simplified version
      const response = await fetch(
        `/api/payment/status/check?nokashId=${nokashTransactionId}`
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          status: data.status,
          data: data,
        };
      }

      return { success: false, status: 'PENDING' };
    } catch (error) {
      console.error('Error checking NOKASH status:', error);
      return { success: false, status: 'PENDING' };
    }
  }

  /**
   * Update payment status in database
   */
  private async updatePaymentStatus(
    paymentId: string,
    update: PaymentStatusUpdate
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status: update.status,
        updatedAt: update.updatedAt,
        lastPollingUpdate: new Date(),
        ...(update.nokashData && { nokashData: update.nokashData }),
      });

      console.log(`Updated payment ${paymentId} status to ${update.status}`);
    } catch (error) {
      console.error(`Error updating payment ${paymentId} status:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const paymentPollingService = new PaymentPollingService();

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    paymentPollingService.stopAllPolling();
  });

  process.on('SIGTERM', () => {
    paymentPollingService.stopAllPolling();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    paymentPollingService.stopAllPolling();
    process.exit(0);
  });
}
