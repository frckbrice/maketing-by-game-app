# 🌍 Internationalization Setup Guide

## 📋 Overview

This guide covers the complete setup of internationalization (i18n) using `react-i18next` in our Next.js lottery application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install react-i18next i18next
# or
yarn add react-i18next i18next
```

### 2. Create Translation Files

```bash
mkdir -p src/lib/messages
touch src/lib/messages/en.json
touch src/lib/messages/fr.json
```

### 3. Configure i18n

```bash
touch src/lib/i18n/config.ts
```

### 4. Create Provider Component

```bash
mkdir -p src/components/providers
touch src/components/providers/I18nProvider.tsx
```

## 📁 File Structure

```
src/
├── lib/
│   ├── i18n/
│   │   └── config.ts          # i18n configuration
│   └── messages/              # Translation files
│       ├── en.json            # English translations
│       └── fr.json            # French translations
├── components/
│   └── providers/
│       └── I18nProvider.tsx   # i18n context provider
└── app/
    └── [locale]/              # Locale-specific routes
        ├── en/                # English pages
        ├── fr/                # French pages
        ├── layout.tsx         # Locale-specific layout
        └── page.tsx           # Home page
```

## ⚙️ Configuration

### 1. i18n Configuration (`src/lib/i18n/config.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enMessages from '../messages/en.json';
import frMessages from '../messages/messages/fr.json';

const resources = {
  en: { translation: enMessages },
  fr: { translation: frMessages },
};

// Only initialize on client side
if (typeof window !== 'undefined') {
  import('react-i18next').then(
    ({ initReactI18next: clientInitReactI18next }) => {
      i18n.use(clientInitReactI18next).init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'fr'],
        debug: false,
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
    }
  );
}

export default i18n;
```

### 2. Translation Files

#### English (`src/lib/messages/en.json`)

```json
{
  "common": {
    "currentLanguage": "Current Language",
    "english": "English",
    "french": "French",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "home": {
    "title": "Welcome to Lottery App",
    "subtitle": "Play and win amazing prizes",
    "cta": "Get Started"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "email": "Email",
    "password": "Password"
  }
}
```

#### French (`src/lib/messages/fr.json`)

```json
{
  "common": {
    "currentLanguage": "Langue Actuelle",
    "english": "Anglais",
    "french": "Français",
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès"
  },
  "home": {
    "title": "Bienvenue sur l'App de Loterie",
    "subtitle": "Jouez et gagnez des prix incroyables",
    "cta": "Commencer"
  },
  "auth": {
    "login": "Connexion",
    "register": "Inscription",
    "email": "Email",
    "password": "Mot de passe"
  }
}
```

### 3. I18nProvider Component (`src/components/providers/I18nProvider.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../lib/i18n/config';

interface I18nProviderProps {
  children: React.ReactNode;
  locale: string;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      try {
        // Wait for i18n to be ready
        if (!i18n.isInitialized) {
          await new Promise(resolve => {
            const checkReady = () => {
              if (i18n.isInitialized) {
                resolve(true);
              } else {
                setTimeout(checkReady, 100);
              }
            };
            checkReady();
          });
        }

        // Change language if needed
        if (i18n.language !== locale) {
          await i18n.changeLanguage(locale);
        }
        setIsReady(true);
      } catch (error) {
        console.warn('Failed to initialize i18n:', error);
        setIsReady(true); // Continue anyway
      }
    };

    initI18n();
  }, [locale]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF5722]"></div>
          <p className="mt-4 text-xl">Initializing i18n...</p>
        </div>
      </div>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
```

### 4. Root Layout Integration (`src/app/[locale]/layout.tsx`)

```typescript
import { I18nProvider } from '../../components/providers/I18nProvider';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body>
        <AuthProvider>
          <I18nProvider locale={locale}>
            {children}
            <Toaster />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 5. Locale-Specific Pages

#### English Home Page (`src/app/[locale]/en/page.tsx`)

```typescript
import { HomePageClient } from '../HomePageClient';

export default function EnglishHomePage() {
  return <HomePageClient locale="en" />;
}
```

#### French Home Page (`src/app/[locale]/fr/page.tsx`)

```typescript
import { HomePageClient } from '../HomePageClient';

export default function FrenchHomePage() {
  return <HomePageClient locale="fr" />;
}
```

### 6. Client Component with Translations (`src/app/[locale]/HomePageClient.tsx`)

```typescript
'use client';

import { useTranslation } from 'react-i18next';
import HomePageComponent from '../../components/home/components/home';

interface HomePageClientProps {
  locale: string;
}

export function HomePageClient({ locale }: HomePageClientProps) {
  const { t } = useTranslation();

  return (
    <div>
      {/* Language Switcher Banner */}
      <div className='bg-[#FF5722] text-white py-2 px-4 text-center'>
        <span className='text-sm'>
          🌍 {t('common.currentLanguage')}:{' '}
          <strong>{locale.toUpperCase()}</strong> |
          <span className='ml-2'>
            <a href='/en' className='underline hover:text-[#FF9800] mr-2'>
              🇺🇸 {t('common.english')}
            </a>
            <a href='/fr' className='underline hover:text-[#FF9800]'>
              🇫🇷 {t('common.french')}
            </a>
          </span>
        </span>
      </div>

      {/* Real Home Page Component */}
      <HomePageComponent />
    </div>
  );
}
```

## 🔧 Usage Examples

### 1. Basic Translation

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t('home.title')}</h1>;
}
```

### 2. Translation with Variables

```typescript
// In translation file
{
  "welcome": "Welcome, {{name}}!"
}

// In component
const { t } = useTranslation();
return <p>{t('welcome', { name: 'John' })}</p>;
```

### 3. Pluralization

```typescript
// In translation file
{
  "tickets": "{{count}} ticket",
  "tickets_plural": "{{count}} tickets"
}

// In component
const { t } = useTranslation();
return <p>{t('tickets', { count: 5 })}</p>; // "5 tickets"
```

### 4. Language Switching

```typescript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fr')}>Français</button>
    </div>
  );
}
```

## 🧪 Testing

### 1. Test Locale Switching

```typescript
// Test that language changes work
const { i18n } = useTranslation();
await i18n.changeLanguage('fr');
expect(i18n.language).toBe('fr');
```

### 2. Test Translation Loading

```typescript
// Test that translations are loaded
const { t } = useTranslation();
expect(t('common.loading')).toBe('Chargement...'); // French
```

### 3. Test Fallback Language

```typescript
// Test fallback when translation is missing
const { t } = useTranslation();
expect(t('missing.key')).toBe('missing.key'); // Falls back to key
```

## 🚨 Common Issues & Solutions

### Issue 1: Translations Not Loading

**Solution:** Check that `I18nProvider` is wrapping your app and locale is being passed correctly.

### Issue 2: SSR Errors

**Solution:** Ensure i18n is only initialized on the client side using `typeof window !== 'undefined'`.

### Issue 3: Language Not Changing

**Solution:** Verify that `i18n.changeLanguage()` is being called and the component is re-rendering.

### Issue 4: Missing Translation Keys

**Solution:** Use the `t` function with fallback values: `t('key', 'Fallback text')`.

## 📚 Best Practices

1. **Keep translation keys organized** - Use dot notation (e.g., `common.loading`)
2. **Provide fallback values** - Always have a default language
3. **Test all locales** - Verify functionality in each supported language
4. **Use TypeScript** - Define translation interfaces for type safety
5. **Lazy load translations** - Load only the languages you need
6. **Handle loading states** - Show loading indicators while i18n initializes

## 🔗 Related Documentation

- [i18n Troubleshooting Guide](../internationalization/i18n-troubleshooting-guide.md)
- [Project Structure](../project-structure.md)
- [Deployment Guide](../deployment/deployment-guide.md)

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Status:** ✅ Active
