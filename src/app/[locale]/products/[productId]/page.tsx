import { ProductDetailsPage } from '@/components/features/shops/components/ProductDetailsPage';
import { ServerStructuredData } from '@/components/seo/ServerStructuredData';
import { getMockProductById } from '@/lib/constants/mockData';
import { generateProductMetadata } from '@/lib/seo/metadata';
import { generateProductStructuredData } from '@/lib/seo/structured-data';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    locale: string;
    productId: string;
  }>;
}

// Server-side product data fetching with Firebase and development fallback
async function getProductData(productId: string) {
  try {
    // Try to fetch from Firebase first
    const { firestoreService } = await import('@/lib/firebase/client-services');
    if (firestoreService.getProduct) {
      const product = await firestoreService.getProduct(productId);
      if (product) {
        return product;
      }
    }

    // Fallback to API route
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`);
    // if (response.ok) {
    //   return await response.json();
    // }

    // Development fallback to mock data
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Using mock product data for productId: ${productId}`);
      return getMockProductById(productId);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
}

// Server-side static params generation
export async function generateStaticParams() {
  // In production, this would fetch from your database
  return [
    { productId: 'product-1' },
    { productId: 'product-2' },
    { productId: 'product-3' },
    { productId: 'product-4' },
  ];
}

// Server-side metadata generation
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductData(productId);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  return generateProductMetadata(product);
}

// Main component
export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const product = await getProductData(productId);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ServerStructuredData
        data={{
          type: 'Product',
          data: generateProductStructuredData(product),
        }}
      />
      <ProductDetailsPage productId={productId} />
    </>
  );
}