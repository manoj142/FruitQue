import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storeApi, Store, CreateStoreData } from '../../services/storeApi';

interface StoreState {
  store: Store | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoreState = {
  store: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchStore = createAsyncThunk(
  'store/fetchStore',
  async (_, { rejectWithValue }) => {
    try {
      const response = await storeApi.getStore();
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch store');
    }
  }
);

export const fetchStoreAdmin = createAsyncThunk(
  'store/fetchStoreAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await storeApi.getStoreAdmin();
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch store');
    }
  }
);

export const createOrUpdateStore = createAsyncThunk(
  'store/createOrUpdateStore',
  async (data: CreateStoreData, { rejectWithValue }) => {
    try {
      const response = await storeApi.createOrUpdateStore(data);
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save store');
    }
  }
);

export const deleteStore = createAsyncThunk(
  'store/deleteStore',
  async (id: string, { rejectWithValue }) => {
    try {
      await storeApi.deleteStore(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete store');
    }
  }
);

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStore: (state) => {
      state.store = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch store
      .addCase(fetchStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStore.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(fetchStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch store admin
      .addCase(fetchStoreAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(fetchStoreAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create or update store
      .addCase(createOrUpdateStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdateStore.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(createOrUpdateStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete store
      .addCase(deleteStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStore.fulfilled, (state) => {
        state.loading = false;
        state.store = null;
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearStore } = storeSlice.actions;
export default storeSlice.reducer;
export type { StoreState };
