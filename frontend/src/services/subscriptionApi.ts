import { api } from './api';

export interface CreateSubscriptionData {
  name: string;
  type: 'weekly' | 'biweekly' | 'monthly';
  items: Array<{
    product: string;
    quantity: number;
  }>;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  paymentMethod?: string;
  deliveryInstructions?: string;
  startDate?: string;
}

export interface UpdateSubscriptionData {
  name?: string;
  type?: 'weekly' | 'biweekly' | 'monthly';
  items?: Array<{
    product: string;
    quantity: number;
  }>;
  customerDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  paymentMethod?: string;
  deliveryInstructions?: string;
  status?: 'active' | 'paused' | 'cancelled';
}

export interface Subscription {
  _id: string;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  name: string;
  type: 'weekly' | 'biweekly' | 'monthly';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      image: string;
      category: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  startDate: string;
  nextDeliveryDate: string;
  lastDeliveryDate?: string;
  endDate?: string;
  paymentMethod: string;
  deliveryInstructions?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStats {
  statusStats: {
    active: number;
    paused: number;
    cancelled: number;
    expired: number;
  };
  totalActiveRevenue: number;
  typeStats: {
    weekly?: number;
    biweekly?: number;
    monthly?: number;
  };
}

export const subscriptionApi = {
  // Admin endpoints
  createSubscription: async (data: CreateSubscriptionData) => {
    const response = await api.post('/subscriptions/create', data);
    return response.data;
  },

  getAllSubscriptions: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get('/subscriptions', { params });
    return response.data;
  },

  getDueSubscriptions: async () => {
    const response = await api.get('/subscriptions/admin/due');
    return response.data;
  },

  getSubscriptionStats: async () => {
    const response = await api.get('/subscriptions/admin/stats');
    return response.data;
  },

  deleteSubscription: async (id: string) => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },

  // User endpoints
  getUserSubscriptions: async () => {
    const response = await api.get('/subscriptions/my-subscriptions');
    return response.data;
  },

  getSubscriptionById: async (id: string) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  updateSubscription: async (id: string, data: UpdateSubscriptionData) => {
    const response = await api.put(`/subscriptions/${id}`, data);
    return response.data;
  },

  pauseSubscription: async (id: string) => {
    const response = await api.patch(`/subscriptions/${id}/pause`);
    return response.data;
  },

  resumeSubscription: async (id: string) => {
    const response = await api.patch(`/subscriptions/${id}/resume`);
    return response.data;
  },

  cancelSubscription: async (id: string) => {
    const response = await api.patch(`/subscriptions/${id}/cancel`);
    return response.data;
  },
};
