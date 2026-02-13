// lib/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enMessages from '../messages/en.json';
import frMessages from '../messages/fr.json';

const resources = {
  en: { translation: enMessages },
  fr: { translation: frMessages },
};

// Initialize i18n once (prevents duplicate init under HMR/SSR)
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    // Initialize sync on server to avoid async race conditions; keep async in browser
    initImmediate: typeof window !== 'undefined',
  });
}

export default i18n;
