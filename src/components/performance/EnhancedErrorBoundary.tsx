'use client';

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    retry: () => void;
    errorId?: string;
    t: any;
    router: any;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
}

// Generate unique error ID for tracking
const generateErrorId = () =>
  `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

class EnhancedErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = generateErrorId();
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId || generateErrorId();

    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Enhanced error logging
    this.props.onError?.(error, errorInfo, errorId);

    // Log error with context
    const errorContext = {
      errorId,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      level: this.props.level || 'component',
      componentStack: errorInfo.componentStack,
    };

    if (process.env.NODE_ENV === 'production') {
      //TODO: In production, send to error tracking service
      console.error('Enhanced Error Boundary caught error:', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context: errorContext,
      });

      // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
    } else {
      // In development, detailed logging
      console.group(`🚨 Error Boundary (${errorId})`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', errorContext);
      console.groupEnd();
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          retry={this.retry}
          errorId={this.state.errorId}
          level={this.props.level}
          showDetails={this.props.showDetails}
          FallbackComponent={this.props.fallback}
        />
      );
    }

    return this.props.children;
  }
}

// Separate functional component to use hooks
const ErrorBoundaryFallback: React.FC<{
  error?: Error;
  retry: () => void;
  errorId?: string;
  level?: string;
  showDetails?: boolean;
  FallbackComponent?: React.ComponentType<any>;
}> = ({
  error,
  retry,
  errorId,
  level = 'component',
  showDetails = false,
  FallbackComponent,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  if (FallbackComponent) {
    return (
      <FallbackComponent
        error={error}
        retry={retry}
        errorId={errorId}
        t={t}
        router={router}
      />
    );
  }

  const isPageLevel = level === 'page' || level === 'critical';
  const containerClass = isPageLevel
    ? 'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'
    : 'min-h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 m-4';

  return (
    <div className={containerClass}>
      <div className='text-center max-w-md mx-auto'>
        {/* Error Icon */}
        <div
          className={`mx-auto mb-6 ${
            isPageLevel ? 'w-20 h-20' : 'w-16 h-16'
          } bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center`}
        >
          <AlertTriangle
            className={`${
              isPageLevel ? 'w-10 h-10' : 'w-8 h-8'
            } text-red-600 dark:text-red-400`}
          />
        </div>

        {/* Error Title */}
        <h3
          className={`${
            isPageLevel ? 'text-2xl' : 'text-lg'
          } font-semibold text-gray-900 dark:text-white mb-3`}
        >
          {level === 'critical'
            ? t('error.criticalError')
            : level === 'page'
              ? t('error.pageError')
              : t('error.somethingWentWrong')}
        </h3>

        {/* Error Message */}
        <p className='text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed'>
          {error?.message || t('error.unexpectedError')}
        </p>

        {/* Error ID for support */}
        {errorId && (
          <div className='mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('error.errorId')}: <code className='font-mono'>{errorId}</code>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <button
            onClick={retry}
            className='flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium'
          >
            <RefreshCw className='w-4 h-4' />
            {t('common.tryAgain')}
          </button>

          {isPageLevel && (
            <>
              <button
                onClick={() => router.back()}
                className='flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium'
              >
                <ArrowLeft className='w-4 h-4' />
                {t('common.goBack')}
              </button>

              <button
                onClick={() => router.push('/')}
                className='flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium'
              >
                <Home className='w-4 h-4' />
                {t('common.goHome')}
              </button>
            </>
          )}
        </div>

        {/* Developer Details */}
        {(process.env.NODE_ENV === 'development' || showDetails) && error && (
          <details className='mt-6 text-left'>
            <summary className='text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors'>
              {t('error.technicalDetails')} ({process.env.NODE_ENV})
            </summary>
            <div className='mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg'>
              <pre className='text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40 whitespace-pre-wrap break-words'>
                {error.stack}
              </pre>
            </div>
          </details>
        )}

        {/* Help Text */}
        {level === 'critical' && (
          <div className='mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
            <p className='text-sm text-yellow-800 dark:text-yellow-200'>
              {t('error.persistentIssue')}{' '}
              {errorId && t('error.contactSupport', { errorId })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedErrorBoundary;
