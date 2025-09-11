/**
 * Firestore retry utilities for handling network connectivity issues
 */

import { FirebaseError } from 'firebase/app';

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

/**
 * Executes a Firestore operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry certain errors
      if (error instanceof FirebaseError) {
        const code = error.code;

        // Don't retry authentication errors, permission errors, or not found errors
        if (
          code.includes('permission-denied') ||
          code.includes('unauthenticated') ||
          code.includes('not-found') ||
          code.includes('already-exists') ||
          code.includes('invalid-argument')
        ) {
          throw error;
        }

        // Only retry network-related errors
        if (
          !code.includes('unavailable') &&
          !code.includes('cancelled') &&
          !code.includes('deadline-exceeded') &&
          !code.includes('resource-exhausted') &&
          !code.includes('internal')
        ) {
          throw error;
        }
      }

      // If this is the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );

      console.warn(
        `Firestore operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms:`,
        error instanceof Error ? error.message : error
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if error is a network connectivity issue
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof FirebaseError) {
    return (
      error.code === 'unavailable' ||
      error.code === 'cancelled' ||
      error.code === 'deadline-exceeded'
    );
  }

  return false;
}

/**
 * Get user-friendly error message for Firestore errors
 */
export function getFirestoreErrorMessage(error: any): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'unavailable':
        return 'Service temporarily unavailable. Please check your connection and try again.';
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
      case 'unauthenticated':
        return 'Please sign in to continue.';
      case 'not-found':
        return 'The requested data was not found.';
      case 'already-exists':
        return 'This data already exists.';
      case 'cancelled':
        return 'The operation was cancelled due to a network issue.';
      case 'deadline-exceeded':
        return 'The operation timed out. Please try again.';
      case 'resource-exhausted':
        return 'Too many requests. Please wait a moment and try again.';
      case 'internal':
        return 'An internal error occurred. Please try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  return error?.message || 'An unexpected error occurred.';
}
