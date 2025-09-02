'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';

interface CartItem {
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

interface CartState {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
}

type CartAction =
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, size?: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART':
      const loadedItems = action.payload;
      return {
        items: loadedItems,
        itemCount: loadedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: loadedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };

    case 'ADD_ITEM':
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.productId === newItem.productId && item.size === newItem.size
      );

      let updatedItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...state.items, { ...newItem, id: `${newItem.productId}-${newItem.size || 'default'}-${Date.now()}` }];
      }

      return {
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };

    case 'UPDATE_QUANTITY':
      const { id, quantity } = action.payload;
      const updatedQuantityItems = quantity > 0
        ? state.items.map(item => item.id === id ? { ...item, quantity } : item)
        : state.items.filter(item => item.id !== id);

      return {
        items: updatedQuantityItems,
        itemCount: updatedQuantityItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedQuantityItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        items: filteredItems,
        itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };

    case 'CLEAR_CART':
      return {
        items: [],
        itemCount: 0,
        totalAmount: 0,
      };

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  itemCount: 0,
  totalAmount: 0,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          localStorage.removeItem('cart');
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item as CartItem });
    toast.success('Added to cart!');
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (productId: string, size?: string) => {
    const item = state.items.find(
      item => item.productId === productId && item.size === size
    );
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};