export interface CreateOrderData {
  userId: string;
  shopId: string;
  shopName: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    size?: string;
  }[];
  deliveryMethodId: string;
  deliveryAddressId?: string;
  paymentMethod: 'MOBILE_MONEY' | 'CREDIT_CARD' | 'PAYPAL';
}

export interface UpdateOrderData {
  orderId: string;
  status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  estimatedDeliveryDate?: number;
  actualDeliveryDate?: number;
}

export interface CheckoutItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
}

export interface CheckoutPageProps {
  items: CheckoutItem[];
  shopId: string;
  shopName: string;
  onBack?: () => void;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size?: string;
  shopId: string;
  shopName: string;
}
