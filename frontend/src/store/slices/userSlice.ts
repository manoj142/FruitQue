import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
  inactiveUsers: number;
}

interface UserState {
  users: User[];
  selectedUser: User | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  stats: null,
  loading: false,
  error: null,
  operationLoading: false,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, '_id' | 'createdAt'> & { password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }: { id: string; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/users/stats');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user stats');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data?.users || action.payload.users || action.payload.data || action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.operationLoading = false;
        const newUser = action.payload.data?.user || action.payload.user || action.payload;
        state.users.push(newUser);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedUser = action.payload.data?.user || action.payload.user || action.payload;
        const index = state.users.findIndex(user => user._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.selectedUser && state.selectedUser._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        if (state.selectedUser && state.selectedUser._id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.selectedUser = action.payload.data?.user || action.payload.user || action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedUser, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
export type { UserState };
