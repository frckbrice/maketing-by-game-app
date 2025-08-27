'use client';

import { useTranslation } from 'react-i18next';

export function TranslationTest() {
  const { t, i18n } = useTranslation();

  return (
    <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4'>
      <h3 className='text-lg font-semibold mb-2'>Translation Test</h3>
      <div className='space-y-2 text-sm'>
        <p>
          <strong>Current Language:</strong> {i18n.language}
        </p>
        <p>
          <strong>Home:</strong> {t('common.home')}
        </p>
        <p>
          <strong>Loading:</strong> {t('common.loading')}
        </p>
        <p>
          <strong>Success:</strong> {t('common.success')}
        </p>
        <p>
          <strong>Back:</strong> {t('common.back')}
        </p>
      </div>
    </div>
  );
}
