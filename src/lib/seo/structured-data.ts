export interface StructuredDataConfig {
  type:
    | 'WebSite'
    | 'WebPage'
    | 'Organization'
    | 'Product'
    | 'Game'
    | 'Shop'
    | 'BreadcrumbList'
    | 'FAQPage'
    | 'Article';
  data: any;
}

export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lottery App',
    url: 'https://lottery-app.vercel.app',
    description:
      'Participate in exciting lottery games and win incredible prizes',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://lottery-app.vercel.app/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lottery App',
      url: 'https://lottery-app.vercel.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lottery-app.vercel.app/images/logo.png',
      },
    },
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lottery App',
    url: 'https://lottery-app.vercel.app',
    logo: 'https://lottery-app.vercel.app/images/logo.png',
    description:
      'A secure and fair lottery platform for exciting games and prizes',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-LOTTERY',
      contactType: 'customer service',
      availableLanguage: ['English', 'French'],
    },
    sameAs: [
      'https://twitter.com/lotteryapp',
      'https://facebook.com/lotteryapp',
      'https://instagram.com/lotteryapp',
    ],
  };
}

export function generateProductStructuredData(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map((img: any) => img.url) || [product.thumbnailUrl],
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Lottery App',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.shop?.name || 'Lottery App',
      },
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewsCount || 0,
        }
      : undefined,
    category: product.category,
    sku: product.id,
  };
}

export function generateGameStructuredData(game: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: game.title,
    description: game.description,
    image: game.images?.map((img: any) => img.url) || [game.bannerUrl],
    genre: 'Lottery',
    gamePlatform: 'Web',
    publisher: {
      '@type': 'Organization',
      name: 'Lottery App',
    },
    offers: {
      '@type': 'Offer',
      price: game.ticketPrice || 0,
      priceCurrency: game.currency || 'USD',
      availability:
        game.status === 'ACTIVE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
    aggregateRating: game.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: game.rating,
          reviewCount: game.participantsCount || 0,
        }
      : undefined,
    datePublished: new Date(game.startDate).toISOString(),
    dateModified: new Date(game.updatedAt).toISOString(),
  };
}

export function generateShopStructuredData(shop: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: shop.name,
    description: shop.description,
    image: [shop.bannerUrl, shop.logoUrl].filter(Boolean),
    url: `https://lottery-app.vercel.app/shops/${shop.id}`,
    telephone: shop.phone,
    email: shop.email,
    address: shop.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: shop.address.street,
          addressLocality: shop.address.city,
          addressRegion: shop.address.state,
          postalCode: shop.address.postalCode,
          addressCountry: shop.address.country,
        }
      : undefined,
    openingHours: shop.openingHours || 'Mo-Su 00:00-23:59',
    aggregateRating: shop.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: shop.rating,
          reviewCount: shop.reviewsCount || 0,
        }
      : undefined,
    priceRange: shop.priceRange || '$$',
    paymentAccepted: ['Credit Card', 'PayPal', 'Bank Transfer'],
    currenciesAccepted: ['USD', 'EUR', 'CAD'],
  };
}

export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://lottery-app.vercel.app${crumb.url}`,
    })),
  };
}

export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleStructuredData(article: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author || 'Lottery App Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lottery App',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lottery-app.vercel.app/images/logo.png',
      },
    },
    datePublished: new Date(article.publishedAt).toISOString(),
    dateModified: new Date(article.updatedAt).toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://lottery-app.vercel.app${article.url}`,
    },
  };
}
