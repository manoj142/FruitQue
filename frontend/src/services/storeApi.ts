import { api } from './api';

export interface Store {
  _id: string;
  name: string;
  location: string;
  contact: string;
  email: string;
  instagram?: string;
  description?: string;
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreData {
  name: string;
  location: string;
  contact: string;
  email: string;
  instagram?: string;
  description?: string;
  openingTime?: string;
  closingTime?: string;
}

export const storeApi = {
  // Get store details (public)
  getStore: async () => {
    const response = await api.get('/store');
    return response.data;
  },

  // Get store details for admin
  getStoreAdmin: async () => {
    const response = await api.get('/admin/store');
    return response.data;
  },

  // Create or update store
  createOrUpdateStore: async (data: CreateStoreData) => {
    const response = await api.post('/admin/store', data);
    return response.data;
  },

  // Delete store
  deleteStore: async (id: string) => {
    const response = await api.delete(`/admin/store/${id}`);
    return response.data;
  }
};
