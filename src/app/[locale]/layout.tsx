// app/[locale]/layout.tsx
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/lib/themes/theme-provider';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { I18nProvider } from '../../components/providers/I18nProvider';
import { AuthProvider } from '../../lib/contexts/AuthContext';
import '../globals.css';

// Define supported locales
const locales = ['en', 'fr'] as const;
type Locale = (typeof locales)[number];

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return { title: 'Lottery App' };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    // console.log('Locale not found', locale); // TODO: Add proper logging
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />
        <meta name='theme-color' content='#FF5722' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
        <meta name='apple-mobile-web-app-title' content='Lottery App' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-TileColor' content='#FF5722' />
        <meta name='msapplication-tap-highlight' content='no' />
        <link rel='manifest' href='/manifest.json' />
        <link rel='icon' href='/favicon.ico' />
        <link rel='apple-touch-icon' href='/icons/apple-touch-icon.png' />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/icons/favicon-16x16.png'
        />
        <link rel='icon' type='image/svg+xml' href='/icons/icon.svg' />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <I18nProvider locale={locale}>
                {children}
                <Toaster
                  position='top-right'
                  richColors
                  closeButton
                  duration={4000}
                />
              </I18nProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
