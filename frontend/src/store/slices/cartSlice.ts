import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
  unit?: string;
  category?: string;
  hasSubscription?: boolean;
  customization?: {
    baseProduct: string;
    selectedFruits: Array<{
      fruitId: string;
      fruitName: string;
      quantity: number;
    }>;
  };
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  total: number; // Changed from totalPrice to total
  shippingAddress: any | null;
  paymentMethod: string | null;
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  totalItems: 0,
  total: 0,
  shippingAddress: null,
  paymentMethod: null,
};

// Calculate totals helper
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, total };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    ...initialState,
    ...calculateTotals(initialState.items),
  },
  reducers: {    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.total = totals.total;
      
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.total = totals.total;
      
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
      updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter(item => item.id !== action.payload.id);
        }
      }
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.total = totals.total;
      
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.total = 0;
      localStorage.removeItem('cartItems');
    },
    
    setShippingAddress: (state, action: PayloadAction<any>) => {
      state.shippingAddress = action.payload;
    },
    
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setShippingAddress,
  setPaymentMethod,
} = cartSlice.actions;

export type { CartState };

export default cartSlice.reducer;
