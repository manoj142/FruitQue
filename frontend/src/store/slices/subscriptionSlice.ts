import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionApi, Subscription, SubscriptionStats, CreateSubscriptionData, UpdateSubscriptionData } from '../../services/subscriptionApi';

interface SubscriptionState {
  subscriptions: Subscription[];
  userSubscriptions: Subscription[];
  currentSubscription: Subscription | null;
  dueSubscriptions: Subscription[];
  stats: SubscriptionStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  userSubscriptions: [],
  currentSubscription: null,
  dueSubscriptions: [],
  stats: null,
  loading: false,
  error: null,
  pagination: null,
};

// Admin thunks
export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (data: CreateSubscriptionData, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.createSubscription(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription');
    }
  }
);

export const getAllSubscriptions = createAsyncThunk(
  'subscription/getAll',
  async (params: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getAllSubscriptions(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

export const getDueSubscriptions = createAsyncThunk(
  'subscription/getDue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getDueSubscriptions();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch due subscriptions');
    }
  }
);

export const getSubscriptionStats = createAsyncThunk(
  'subscription/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getSubscriptionStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription stats');
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  'subscription/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await subscriptionApi.deleteSubscription(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subscription');
    }
  }
);

// User thunks
export const getUserSubscriptions = createAsyncThunk(
  'subscription/getUserSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getUserSubscriptions();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user subscriptions');
    }
  }
);

export const getSubscriptionById = createAsyncThunk(
  'subscription/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getSubscriptionById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscription/update',
  async ({ id, data }: { id: string; data: UpdateSubscriptionData }, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.updateSubscription(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subscription');
    }
  }
);

export const pauseSubscription = createAsyncThunk(
  'subscription/pause',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.pauseSubscription(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pause subscription');
    }
  }
);

export const resumeSubscription = createAsyncThunk(
  'subscription/resume',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.resumeSubscription(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resume subscription');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.cancelSubscription(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSubscription: (state) => {
      state.currentSubscription = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions.unshift(action.payload.subscription);
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get all subscriptions
      .addCase(getAllSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload.subscriptions;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get due subscriptions
      .addCase(getDueSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDueSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.dueSubscriptions = action.payload.subscriptions;
      })
      .addCase(getDueSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get subscription stats
      .addCase(getSubscriptionStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getSubscriptionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete subscription
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = state.subscriptions.filter(sub => sub._id !== action.payload);
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get user subscriptions
      .addCase(getUserSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.userSubscriptions = action.payload.subscriptions;
      })
      .addCase(getUserSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get subscription by ID
      .addCase(getSubscriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload.subscription;
      })
      .addCase(getSubscriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update subscription
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSub = action.payload.subscription;
        
        // Update in all relevant arrays
        state.subscriptions = state.subscriptions.map(sub => 
          sub._id === updatedSub._id ? updatedSub : sub
        );
        state.userSubscriptions = state.userSubscriptions.map(sub => 
          sub._id === updatedSub._id ? updatedSub : sub
        );
        
        if (state.currentSubscription?._id === updatedSub._id) {
          state.currentSubscription = updatedSub;
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Pause subscription
      .addCase(pauseSubscription.fulfilled, (state, action) => {
        const updatedSub = action.payload.subscription;
        
        state.subscriptions = state.subscriptions.map(sub => 
          sub._id === updatedSub._id ? updatedSub : sub
        );
        state.userSubscriptions = state.userSubscriptions.map(sub => 
          sub._id === updatedSub._id ? updatedSub : sub
        );
        
        if (state.currentSubscription?._id === updatedSub._id) {
          state.currentSubscription = updatedSub;
        }
      })
      
      // Resume subscription
      .addCase(resumeSubscription.fulfilled, (state, action) => {
        const updatedSub = action.payload.subscription;
        
        state.subscriptions = state.subscriptions.map(sub => 
          sub._id === updatedSub._id ? updatedSub : sub
        );
        state.userSubscriptions = state.userSubscriptions.map(sub => 
          sub._id === updatedSub._id ? updatedSub : sub
        );
        
        if (state.currentSubscription?._id === updatedSub._id) {
          state.currentSubscription = updatedSub;
        }
      })
      
      // Cancel subscription
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        const updatedSub = action.payload.subscription;
        
        state.subscriptions = state.subscriptions.map(sub => 
          sub._id === updatedSub._id ? updatedSub : sub
        );
        state.userSubscriptions = state.userSubscriptions.map(sub => 
          sub._id === updatedSub._id ? updatedSub : sub
        );
        
        if (state.currentSubscription?._id === updatedSub._id) {
          state.currentSubscription = updatedSub;
        }
      });
  },
});

export const { clearError, clearCurrentSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
