'use client';

import { useEffect } from 'react';

type Props = {
  error: Error;
  reset(): void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    // TODO: forward to a telemetry adapter in production (Sentry/OTEL/etc.)
  }, [error]);

  return (
    <div className='min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold mb-6 text-red-500'>
          Something went wrong!
        </h1>
        <p className='text-xl text-gray-300 mb-8'>
          An error occurred while loading this page
        </p>
        <button
          className='bg-[#FF5722] hover:bg-[#FF9800] text-white font-bold py-3 px-6 rounded-lg transition-colors'
          onClick={reset}
          type='button'
        >
          Try again
        </button>
      </div>
    </div>
  );
}
