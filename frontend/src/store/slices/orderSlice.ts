import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  orderItems?: OrderItem[]; // Backend uses orderItems
  items?: OrderItem[]; // Frontend fallback
  totalAmount: number;
  orderStatus?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Backend field
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Frontend fallback
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  deliveryDate?: Date;
  deliveredAt?: Date;
  trackingNumber?: string;
  pricing?: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  product: string | {
    _id: string;
    name: string;
    images: string[];
  };
  name: string;
  price: number;
  quantity: number;
  totalPrice?: number; // Backend includes this
  image: string;
}

export interface Address {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  stats: OrderStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    limit: number;
  };
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
  },
};

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/user');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const fetchOrderStats = createAsyncThunk(
  'orders/fetchOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/orders/stats');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order stats');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
        state.orders.unshift(action.payload.order);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalOrders: action.payload.totalOrders,
          limit: action.payload.limit,
        };
      })      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both response formats from backend
        if (action.payload.data && action.payload.data.orders) {
          state.orders = action.payload.data.orders;
          if (action.payload.data.pagination) {
            state.pagination = {
              currentPage: action.payload.data.pagination.page,
              totalPages: action.payload.data.pagination.pages,
              totalOrders: action.payload.data.pagination.total,
              limit: action.payload.data.pagination.limit,
            };
          }
        } else {
          state.orders = action.payload.orders || action.payload.data || action.payload;
        }
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order._id === action.payload.order._id);
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
        if (state.currentOrder?._id === action.payload.order._id) {
          state.currentOrder = action.payload.order;
        }
      })
      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order._id === action.payload.order._id);
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
        if (state.currentOrder?._id === action.payload.order._id) {
          state.currentOrder = action.payload.order;
        }
      })
      // Fetch order stats
      .addCase(fetchOrderStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPage } = orderSlice.actions;
export default orderSlice.reducer;
export type { OrderState };
