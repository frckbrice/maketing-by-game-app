import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: { locale: string; url: string }[];
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
}

export const defaultSEO: SEOConfig = {
  title: 'Lottery App - Win Amazing Prizes',
  description:
    'Participate in exciting lottery games and win incredible prizes. Join thousands of players in our secure and fair lottery platform.',
  keywords: ['lottery', 'games', 'prizes', 'win', 'gambling', 'entertainment'],
  image: '/images/og-image.jpg',
  url: 'https://lottery-app.vercel.app',
  type: 'website',
  locale: 'en',
  alternateLocales: [
    { locale: 'en', url: 'https://lottery-app.vercel.app/en' },
    { locale: 'fr', url: 'https://lottery-app.vercel.app/fr' },
  ],
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
    locale = 'en',
    alternateLocales = [],
    noIndex = false,
    noFollow = false,
    canonical,
  } = config;

  const fullTitle = title.includes('Lottery App')
    ? title
    : `${title} | Lottery App`;
  const fullImage = image?.startsWith('http')
    ? image
    : `${defaultSEO.url}${image}`;
  const fullUrl = url?.startsWith('http') ? url : `${defaultSEO.url}${url}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: [...(defaultSEO.keywords || []), ...(keywords || [])].join(', '),
    authors: author ? [{ name: author }] : undefined,
    creator: 'Lottery App',
    publisher: 'Lottery App',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(defaultSEO.url || 'https://lottery-app.vercel.app'),
    alternates: {
      canonical: canonical || fullUrl,
      languages: {
        en: '/en',
        fr: '/fr',
        ...Object.fromEntries(
          alternateLocales.map(alt => [alt.locale, alt.url])
        ),
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'Lottery App',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: type === 'product' ? 'website' : type,
      publishedTime,
      modifiedTime,
      section,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: '@lotteryapp',
      site: '@lotteryapp',
    },
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_ID,
      yandex: process.env.YANDEX_VERIFICATION_ID,
      yahoo: process.env.YAHOO_VERIFICATION_ID,
    },
    category: 'entertainment',
  };

  return metadata;
}

export function generateShopMetadata(
  shop: any,
  locale: string = 'en'
): Metadata {
  return generateMetadata({
    title: `${shop.name} - Shop`,
    description:
      shop.description ||
      `Discover amazing products at ${shop.name}. ${shop.followersCount || 0} followers and counting!`,
    keywords: [
      'shop',
      'marketplace',
      'products',
      shop.name,
      ...(shop.tags || []),
    ],
    image: shop.bannerUrl || shop.logoUrl,
    url: `/shops/${shop.id}`,
    type: 'website',
    locale,
    section: 'Marketplace',
    tags: shop.tags || [],
  });
}

export function generateProductMetadata(
  product: any,
  locale: string = 'en'
): Metadata {
  return generateMetadata({
    title: product.name,
    description:
      product.description ||
      `Buy ${product.name} for ${product.currency} ${product.price}. ${product.rating ? `Rated ${product.rating}/5 stars.` : ''}`,
    keywords: ['product', 'buy', 'shop', product.name, ...(product.tags || [])],
    image: product.images?.[0]?.url || product.thumbnailUrl,
    url: `/products/${product.id}`,
    type: 'product',
    locale,
    section: 'Products',
    tags: product.tags || [],
  });
}

export function generateGameMetadata(
  game: any,
  locale: string = 'en'
): Metadata {
  return generateMetadata({
    title: game.title,
    description:
      game.description ||
      `Join the ${game.title} lottery game. Prize pool: ${game.currency} ${game.totalPrizePool || 0}. ${game.currentParticipants || 0} participants.`,
    keywords: ['lottery', 'game', 'prize', game.title, ...(game.tags || [])],
    image: game.images?.[0]?.url || game.bannerUrl,
    url: `/games/${game.id}`,
    type: 'website',
    locale,
    section: 'Games',
    tags: game.tags || [],
  });
}

export function generateOrderMetadata(
  orderId: string,
  locale: string = 'en'
): Metadata {
  return generateMetadata({
    title: `Order #${orderId}`,
    description: `Track your order #${orderId} status and details.`,
    keywords: ['order', 'track', 'purchase', orderId],
    url: `/orders/track/${orderId}`,
    type: 'website',
    locale,
    noIndex: true, // Don't index order pages
  });
}
