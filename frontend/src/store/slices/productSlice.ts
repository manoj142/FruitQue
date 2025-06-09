import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  productType: 'fruit' | 'bowl'; // New field to distinguish product types
  price: number; // Required for both fruit and bowl
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  subcategory?: string;
  stock: number;
  inStock?: boolean; // Computed property for backward compatibility
  unit: string;
  weight?: number;
  ratings: {
    average: number;
    count: number;
  };
  // Computed properties for backward compatibility
  rating?: number;
  reviewCount?: number;
  isOrganic: boolean;
  isAvailable?: boolean;
  isSeasonal?: boolean;
  tags?: string[];
  nutritionalInfo?: {
    calories: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    vitamins?: string[];
    minerals?: string[];
  };
  origin?: string;
  season?: string[];  // Bowl-specific fields (required for bowl type)
  isCustomizable?: boolean;
  hasSubscription?: boolean;
  subProducts?: Product[]; // Array of fruit products for bowls
  maxSubProducts?: number; // Maximum number of subproducts that can be selected for customizable bowls
  // Fruit-specific fields (required for fruit type)
  fruitSeason?: string; // Season for fruits only
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductStats {
  totalProducts: number;
  availableProducts: number;
  outOfStockProducts: number;
  organicProducts: number;
  lowStockProducts: number;
  categoryStats: { _id: string; count: number }[];
  typeStats: { _id: string; count: number }[];
}

interface ProductState {
  products: Product[];
  seasonalProducts: Product[];
  bowlProducts: Product[]; // New: only bowl products for user display
  fruitProducts: Product[]; // New: only fruit products for selection
  categories: { _id: string; count: number }[];
  currentProduct: Product | null;
  stats: ProductStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    limit: number;
  };
  filters: {
    category: string;
    priceRange: [number, number];
    rating: number;
    isOrganic: boolean | null;
    inStock: boolean;
    search: string;
  };
}

const initialState: ProductState = {
  products: [],
  seasonalProducts: [],
  bowlProducts: [],
  fruitProducts: [],
  categories: [],
  currentProduct: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  },
  filters: {
    category: '',
    priceRange: [0, 1000],
    rating: 0,
    isOrganic: null,
    inStock: true,
    search: '',
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Admin product management thunks
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: Partial<Product>, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }: { id: string; productData: Partial<Product> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const fetchSeasonalProducts = createAsyncThunk(
  'products/fetchSeasonalProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/seasonal');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seasonal products');
    }
  }
);

export const fetchBowlProducts = createAsyncThunk(
  'products/fetchBowlProducts',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/bowls', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bowl products');
    }
  }
);

export const fetchFruitProducts = createAsyncThunk(
  'products/fetchFruitProducts',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/fruits', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch fruit products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchProductStats = createAsyncThunk(
  'products/fetchProductStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/products/stats');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product stats');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure
        const data = action.payload.data || action.payload;
        state.products = data.products || [];
        
        // Handle pagination if available
        if (data.pagination) {
          state.pagination = {
            currentPage: data.pagination.page || 1,
            totalPages: data.pagination.pages || 1,
            totalProducts: data.pagination.total || 0,
            limit: data.pagination.limit || 12,
          };
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.products = []; // Ensure default empty array
        state.error = action.payload as string;
      })      // Featured products section removed
      // Fetch seasonal products
      .addCase(fetchSeasonalProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(fetchSeasonalProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure
        const data = action.payload.data || action.payload;
        state.seasonalProducts = data.products || [];
      })
      .addCase(fetchSeasonalProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.seasonalProducts = []; // Ensure default empty array
        state.error = action.payload as string;
      })
      // Fetch bowl products
      .addCase(fetchBowlProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBowlProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure
        const data = action.payload.data || action.payload;
        state.bowlProducts = data.products || [];
      })
      .addCase(fetchBowlProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.bowlProducts = [];
        state.error = action.payload as string;
      })
      // Fetch fruit products
      .addCase(fetchFruitProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFruitProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure
        const data = action.payload.data || action.payload;
        state.fruitProducts = data.products || [];
      })
      .addCase(fetchFruitProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.fruitProducts = [];
        state.error = action.payload as string;
      })// Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure
        const data = action.payload.data || action.payload;
        state.currentProduct = data.product || null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.currentProduct = null; // Ensure default null
        state.error = action.payload as string;
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        // Handle API response structure
        const data = action.payload.data || action.payload;
        state.categories = data.categories || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categories = []; // Ensure default empty array
        state.error = action.payload as string;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(createProduct.fulfilled, (state) => {
        state.isLoading = false;
        // No need to update products array as we'll fetch all products after redirection
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        // No need to update products array as we'll fetch all products after redirection
        
        // We only need to clear currentProduct if it was the one that was updated
        const data = action.payload.data || action.payload;
        const updatedProduct = data.product;
        
        if (updatedProduct && state.currentProduct && state.currentProduct._id === updatedProduct._id) {
          state.currentProduct = null;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        // No need to update products array as we'll fetch all products after redirection
        
        // We only need to clear currentProduct if it was the one that was deleted
        const deletedProductId = action.payload;
        
        if (deletedProductId && state.currentProduct && state.currentProduct._id === deletedProductId) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch product stats
      .addCase(fetchProductStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchProductStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearFilters, setCurrentPage } = productSlice.actions;
export default productSlice.reducer;
export type { ProductState };
