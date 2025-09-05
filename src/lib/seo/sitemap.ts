import { MetadataRoute } from 'next';

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}

export function generateSitemap(
  entries: SitemapEntry[]
): MetadataRoute.Sitemap {
  return entries.map(entry => ({
    url: entry.url,
    lastModified: entry.lastModified || new Date(),
    changeFrequency: entry.changeFrequency || 'weekly',
    priority: entry.priority || 0.5,
  }));
}

export async function getStaticSitemapEntries(): Promise<SitemapEntry[]> {
  const baseUrl = 'https://lottery-app.vercel.app';
  const locales = ['en', 'fr'];

  const staticPages = [
    '',
    '/about',
    '/games',
    '/winners',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/cart',
    '/checkout',
    '/dashboard',
    '/profile',
    '/profile/orders',
    '/profile/gamification',
    '/vendor-application',
    '/vendor-dashboard',
    '/vendor-dashboard/analytics',
    '/vendor-dashboard/create-game',
    '/vendor-dashboard/games',
    '/admin',
    '/admin/games',
    '/admin/users',
    '/admin/vendors',
    '/admin/winners',
    '/admin/analytics',
    '/admin/analytics/revenue',
    '/admin/analytics/users',
    '/admin/marketplace',
    '/admin/notifications',
    '/admin/reports',
    '/admin/roles',
    '/admin/scan-events',
    '/admin/settings',
    '/admin/vendor-applications',
    '/admin/admins',
    '/admin/categories',
    '/admin/create-game',
  ];

  const entries: SitemapEntry[] = [];

  // Add static pages for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  return entries;
}

export async function getDynamicSitemapEntries(): Promise<SitemapEntry[]> {
  const baseUrl = 'https://lottery-app.vercel.app';
  const locales = ['en', 'fr'];
  const entries: SitemapEntry[] = [];

  // Mock data - in production, this would fetch from your database
  const mockShops = [
    { id: 'fashion-hub', name: 'Fashion Hub', updatedAt: new Date() },
    { id: 'tech-store', name: 'Tech Store', updatedAt: new Date() },
    { id: 'home-garden', name: 'Home & Garden', updatedAt: new Date() },
  ];

  const mockProducts = [
    { id: 'product-1', name: 'Product 1', updatedAt: new Date() },
    { id: 'product-2', name: 'Product 2', updatedAt: new Date() },
    { id: 'product-3', name: 'Product 3', updatedAt: new Date() },
  ];

  const mockGames = [
    { id: 'game-1', title: 'Game 1', updatedAt: new Date() },
    { id: 'game-2', title: 'Game 2', updatedAt: new Date() },
    { id: 'game-3', title: 'Game 3', updatedAt: new Date() },
  ];

  // Add shop pages
  for (const locale of locales) {
    for (const shop of mockShops) {
      entries.push({
        url: `${baseUrl}/${locale}/shops/${shop.id}`,
        lastModified: shop.updatedAt,
        changeFrequency: 'daily',
        priority: 0.7,
      });

      // Add shop chat pages
      entries.push({
        url: `${baseUrl}/${locale}/shops/${shop.id}/chat`,
        lastModified: shop.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  // Add product pages
  for (const locale of locales) {
    for (const product of mockProducts) {
      entries.push({
        url: `${baseUrl}/${locale}/products/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  // Add game pages (if they have individual pages)
  for (const locale of locales) {
    for (const game of mockGames) {
      entries.push({
        url: `${baseUrl}/${locale}/games/${game.id}`,
        lastModified: game.updatedAt,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  }

  return entries;
}

export async function getAllSitemapEntries(): Promise<SitemapEntry[]> {
  const staticEntries = await getStaticSitemapEntries();
  const dynamicEntries = await getDynamicSitemapEntries();

  return [...staticEntries, ...dynamicEntries];
}
