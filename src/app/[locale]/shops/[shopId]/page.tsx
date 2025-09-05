import { ShopPage } from '@/components/features/shops/components/ShopPage';
import { ServerStructuredData } from '@/components/seo/ServerStructuredData';
import { generateShopMetadata } from '@/lib/seo/metadata';
import { generateShopStructuredData } from '@/lib/seo/structured-data';
import { notFound } from 'next/navigation';
import { getMockShopById } from '../../../../lib/constants';

interface ShopPageProps {
  params: Promise<{
    locale: string;
    shopId: string;
  }>;
}

// Server-side shop data fetching with Firebase and development fallback
async function getShopData(shopId: string) {
  try {
    // Try to fetch from Firebase first
    const { firestoreService } = await import('@/lib/firebase/client-services');
    if (firestoreService.getShop) {
      const shop = await firestoreService.getShop(shopId);
      if (shop) return shop;
    }

    // Try API call
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // const response = await fetch(`${baseUrl}/api/shops/${shopId}`, {
    //   cache: 'no-store' // Ensure fresh data
    // });

    // if (response.ok) {
    //   return await response.json();
    // }

    // Development fallback to mock data
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Using mock shop data for shopId: ${shopId}`);
      // const mockShops = {
      //   'fashion-hub': {
      //     id: 'fashion-hub',
      //     name: 'Fashion Hub',
      //     description:
      //       'Discover the latest fashion trends and styles at Fashion Hub. From casual wear to formal attire, we have everything you need.',
      //     bannerUrl:
      //       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe1JciGt9CdGDTYhgxVIeXuITbl6idGM0tnQ&s',
      //     logoUrl: '/images/shops/fashion-hub-logo.jpg',
      //     rating: 4.5,
      //     reviewsCount: 128,
      //     followersCount: 2500,
      //     tags: ['fashion', 'clothing', 'style', 'trends'],
      //     address: {
      //       street: '123 Fashion Street',
      //       city: 'New York',
      //       state: 'NY',
      //       postalCode: '10001',
      //       country: 'US',
      //     },
      //     phone: '+1-555-FASHION',
      //     email: 'info@fashionhub.com',
      //     openingHours: 'Mo-Su 09:00-21:00',
      //     priceRange: '$$',
      //   },
      //   'tech-store': {
      //     id: 'tech-store',
      //     name: 'Tech Store',
      //     description:
      //       'Your one-stop shop for the latest technology and gadgets. From smartphones to laptops, we have the best tech deals.',
      //     bannerUrl: '/images/shops/tech-store-banner.jpg',
      //     logoUrl: '/images/shops/tech-store-logo.jpg',
      //     rating: 4.8,
      //     reviewsCount: 256,
      //     followersCount: 5000,
      //     tags: ['technology', 'gadgets', 'electronics', 'computers'],
      //     address: {
      //       street: '456 Tech Avenue',
      //       city: 'San Francisco',
      //       state: 'CA',
      //       postalCode: '94102',
      //       country: 'US',
      //     },
      //     phone: '+237695162642',
      //     email: 'frckbrice@gmail.com',
      //     openingHours: 'Mo-Su 10:00-22:00',
      //     priceRange: '$$$',
      //   },
      // };
      return getMockShopById(shopId);
      // return mockShops[shopId as keyof typeof mockShops] || null;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching shop ${shopId}:`, error);

    // In development, still try to return mock data even on error
    if (process.env.NODE_ENV === 'development') {
      console.warn('Falling back to mock data due to error');
      // const mockShops = {
      //   'fashion-hub': {
      //     id: 'fashion-hub',
      //     name: 'Fashion Hub',
      //     description:
      //       'Discover the latest fashion trends and styles at Fashion Hub.',
      //     bannerUrl:
      //       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe1JciGt9CdGDTYhgxVIeXuITbl6idGM0tnQ&s',
      //     logoUrl:
      //       'https://burst.shopifycdn.com/photos/high-fashion-model-in-red.jpg?width=1000&format=pjpg&exif=0&iptc=0',
      //     rating: 4.5,
      //     reviewsCount: 128,
      //     followersCount: 2500,
      //     tags: ['fashion', 'clothing', 'style', 'trends'],
      //     address: {
      //       street: '123 Fashion Street',
      //       city: 'New York',
      //       state: 'NY',
      //       postalCode: '10001',
      //       country: 'US',
      //     },
      //     phone: '+1-555-FASHION',
      //     email: 'info@fashionhub.com',
      //     openingHours: 'Mo-Su 09:00-21:00',
      //     priceRange: '$$',
      //   },
      //   'tech-store': {
      //     id: 'tech-store',
      //     name: 'Tech Store',
      //     description:
      //       'Your one-stop shop for the latest technology and gadgets.',
      //     bannerUrl:
      //       'data:image/jpeg;base64,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',
      //     logoUrl:
      //       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIyykpOGL4wGyi6Ut2SkrnVCrbyOuIYbmQnw&s',
      //     rating: 4.8,
      //     reviewsCount: 256,
      //     followersCount: 5000,
      //     tags: ['technology', 'gadgets', 'electronics', 'computers'],
      //     address: {
      //       street: '456 Tech Avenue',
      //       city: 'San Francisco',
      //       state: 'CA',
      //       postalCode: '94102',
      //       country: 'US',
      //     },
      //     phone: '+237695162642',
      //     email: 'frckbrice@gmail.com',
      //     openingHours: 'Mo-Su 10:00-22:00',
      //     priceRange: '$$$',
      //   },
      // };
      // return mockShops[shopId as keyof typeof mockShops] || null;
      return getMockShopById(shopId);
    }

    return null;
  }
}

export async function generateStaticParams() {
  // In production, this would fetch from your database
  return [
    { shopId: 'fashion-hub' },
    { shopId: 'tech-store' },
    { shopId: 'home-garden' },
  ];
}

export async function generateMetadata({ params }: ShopPageProps) {
  const { locale, shopId } = await params;
  const shop = await getShopData(shopId);

  if (!shop) {
    return {
      title: 'Shop Not Found',
      description: 'The requested shop could not be found.',
    };
  }

  return generateShopMetadata(shop, locale);
}

export default async function ShopPageLayout({ params }: ShopPageProps) {
  const { shopId, locale } = await params;
  const shop = await getShopData(shopId);

  if (!shop) {
    notFound();
  }

  return (
    <>
      <ServerStructuredData
        data={{
          type: 'Shop',
          data: generateShopStructuredData(shop),
        }}
      />
      <ShopPage shopId={shopId} />
    </>
  );
}
