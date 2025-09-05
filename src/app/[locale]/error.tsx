'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  error: Error;
  reset(): void;
};

export default function Error({ error, reset }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(error);
      router.refresh();
    }
    // TODO: forward to a telemetry adapter in production (Sentry/OTEL/etc.)
  }, [error, router]);

  return (
    <div className='min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='mb-8'>
          <div className='text-8xl mb-4'>⚠️</div>
          <h1 className='text-4xl font-bold mb-4 text-red-500'>
            {t('error.pageError')}
          </h1>
          <p className='text-lg text-gray-300 mb-6'>
            {t('error.unexpectedError')}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className='mb-6 text-left bg-gray-800 p-4 rounded-lg'>
              <summary className='cursor-pointer text-yellow-400 font-medium mb-2'>
                {t('error.technicalDetails')}
              </summary>
              <pre className='text-sm text-gray-300 overflow-auto'>
                {error.message}
              </pre>
            </details>
          )}
        </div>

        <div className='space-y-4'>
          <button
            className='w-full bg-[#FF5722] hover:bg-[#FF9800] text-white font-bold py-3 px-6 rounded-lg transition-colors'
            onClick={reset}
            type='button'
          >
            {t('common.tryAgain')}
          </button>

          <button
            className='w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors'
            onClick={() => router.push('/')}
            type='button'
          >
            {t('common.goHome')}
          </button>
        </div>

        <p className='text-sm text-gray-500 mt-6'>
          {t('error.persistentIssue')}
        </p>
      </div>
    </div>
  );
}
