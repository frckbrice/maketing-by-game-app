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

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

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
        <style dangerouslySetInnerHTML={{__html: `
          :root{--background:0 0% 100%;--foreground:222.2 84% 4.9%;--card:0 0% 100%;--card-foreground:222.2 84% 4.9%;--primary:222.2 47.4% 11.2%;--primary-foreground:210 40% 98%;--border:214.3 31.8% 91.4%;--radius:0.5rem}
          .dark{--background:222.2 84% 4.9%;--foreground:210 40% 98%;--card:222.2 84% 4.9%;--card-foreground:210 40% 98%;--primary:210 40% 98%;--primary-foreground:222.2 47.4% 11.2%;--border:217.2 32.6% 17.5%}
          *{border:0 solid #e5e7eb;box-sizing:border-box}
          html{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;line-height:1.5;-webkit-tap-highlight-color:transparent}
          body{background-color:hsl(var(--background));color:hsl(var(--foreground));margin:0}
          .animate-spin{animation:spin 1s linear infinite}
          @keyframes spin{to{transform:rotate(360deg)}}
        `}} />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />
        <link
          rel='preload'
          href='https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />
        <link rel='modulepreload' href='/_next/static/chunks/webpack.js' />
        <link rel='modulepreload' href='/_next/static/chunks/main-app.js' />
        <link rel='dns-prefetch' href='//firebase.googleapis.com' />
        <link rel='dns-prefetch' href='//firebaseapp.com' />
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
