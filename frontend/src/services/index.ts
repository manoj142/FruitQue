import { api } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

export const productService = {
  getProducts: async (params?: any) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  // getFeaturedProducts removed

  getSeasonalProducts: async () => {
    const response = await api.get('/products/seasonal');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  searchProducts: async (query: string) => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export const orderService = {
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrders: async (params?: any) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  cancelOrder: async (id: string) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },
};

export const userService = {
  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  addAddress: async (address: any) => {
    const response = await api.post('/users/addresses', address);
    return response.data;
  },

  updateAddress: async (id: string, address: any) => {
    const response = await api.put(`/users/addresses/${id}`, address);
    return response.data;
  },

  deleteAddress: async (id: string) => {
    const response = await api.delete(`/users/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id: string) => {
    const response = await api.patch(`/users/addresses/${id}/default`);
    return response.data;
  },
};
