import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  addresses: Address[];
  address?: string; // Single address field for backward compatibility
  createdAt?: string;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
  };
}

export interface Address {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string; // Combined address field
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      const response = await api.post('/auth-simple/login-simple', credentials);
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.data.token);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Attempting registration with:', { name: userData.name, email: userData.email });
      const response = await api.post('/auth-simple/register-simple', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  return null;
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure
        const data = action.payload.data || action.payload;
        state.user = data.user;
        state.token = data.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Handle API response structure
        const data = action.payload.data || action.payload;
        if (data.user && data.token) {
          state.user = data.user;
          state.token = data.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        // Handle API response structure
        const data = action.payload.data || action.payload;
        state.user = data.user || action.payload.user;
        state.isAuthenticated = true;
      }).addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure
        const data = action.payload.data || action.payload;
        state.user = data.user || action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export type { AuthState };
export default authSlice.reducer;
