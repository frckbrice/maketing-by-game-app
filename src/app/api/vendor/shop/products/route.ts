import { NextRequest, NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firebase/services';
import { requireRole } from '@/lib/utils/auth-helpers';
import { Shop, Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and vendor role
    const user = await requireRole(request, 'VENDOR');

    // Find the vendor's shop
    const shops = await firestoreService.getShops({ limit: 1000 });
    const vendorShop = shops.find((shop: Shop) => shop.ownerId === user.id);

    if (!vendorShop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch vendor's products
    const products = await firestoreService.getProducts({ 
      shopId: vendorShop.id, 
      limit 
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and vendor role
    const user = await requireRole(request, 'VENDOR');

    // Find the vendor's shop
    const shops = await firestoreService.getShops({ limit: 1000 });
    const vendorShop = shops.find((shop: Shop) => shop.ownerId === user.id);

    if (!vendorShop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const productData = await request.json();

    // Add shop ID to product data
    const newProduct = {
      ...productData,
      shopId: vendorShop.id,
      status: 'active',
      rating: 0,
      reviewsCount: 0,
      likesCount: 0,
      viewsCount: 0,
      playedCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const productId = await firestoreService.createDocumentWithTimestamps('products', newProduct);

    return NextResponse.json({ id: productId, ...newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}