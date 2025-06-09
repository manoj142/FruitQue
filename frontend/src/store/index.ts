import { configureStore } from '@reduxjs/toolkit';
import authSlice, { AuthState } from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import type { CartState } from './slices/cartSlice';
import productSlice from './slices/productSlice';
import type { ProductState } from './slices/productSlice';
import orderSlice from './slices/orderSlice';
import type { OrderState } from './slices/orderSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import userSlice from './slices/userSlice';
import type { UserState } from './slices/userSlice';
import storeSlice from './slices/storeSlice';
import type { StoreState } from './slices/storeSlice';

export interface RootState {
  auth: AuthState;
  cart: CartState;
  products: ProductState;
  orders: OrderState;
  subscriptions: any; // Using any for now, can be typed later
  user: UserState;
  store: StoreState;
}

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    products: productSlice,
    orders: orderSlice,
    subscriptions: subscriptionSlice,
    user: userSlice,
    store: storeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
