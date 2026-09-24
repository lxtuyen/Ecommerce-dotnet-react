import axios, { AxiosError } from 'axios';
import {
  Category,
  CreateOrderPayload,
  Order,
  Product,
  ServiceResponse,
  User,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:57967/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem('techvault_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed?.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      }
    } catch {
      // Ignore JSON parse error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ServiceResponse<User>>('/Auths', credentials);
    return res.data;
  },
  register: async (userData: { name: string; email: string; password: string }) => {
    const initials = userData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
    const res = await apiClient.post<ServiceResponse<User>>('/Users', {
      ...userData,
      initials,
    });
    return res.data;
  },
};

// Products API
export const productsApi = {
  getAll: async () => {
    const res = await apiClient.get<ServiceResponse<Product[]>>('/Products');
    return res.data.data || [];
  },
  getById: async (id: number) => {
    const res = await apiClient.get<ServiceResponse<Product>>(`/Products/${id}`);
    return res.data.data;
  },
  getByCategory: async (categoryId: number) => {
    const res = await apiClient.get<ServiceResponse<Product[]>>(
      `/Products/${categoryId}/products`
    );
    return res.data.data || [];
  },
  create: async (payload: Partial<Product>) => {
    const res = await apiClient.post<ServiceResponse<Product[]>>('/Products', payload);
    return res.data;
  },
  update: async (payload: Partial<Product>) => {
    const res = await apiClient.put<ServiceResponse<Product>>('/Products', payload);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete<ServiceResponse<Product>>(`/Products/${id}`);
    return res.data;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const res = await apiClient.get<ServiceResponse<Category[]>>('/Categories');
    return res.data.data || [];
  },
  getById: async (id: number) => {
    const res = await apiClient.get<ServiceResponse<Category>>(`/Categories/${id}`);
    return res.data.data;
  },
  create: async (payload: Partial<Category>) => {
    const res = await apiClient.post<ServiceResponse<Category>>('/Categories', payload);
    return res.data;
  },
  update: async (payload: Partial<Category>) => {
    const res = await apiClient.put<ServiceResponse<Category>>('/Categories', payload);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete<ServiceResponse<Category>>(`/Categories/${id}`);
    return res.data;
  },
};

// Orders API
export const ordersApi = {
  create: async (payload: CreateOrderPayload) => {
    const res = await apiClient.post<ServiceResponse<Order>>('/Orders', payload);
    return res.data;
  },
  getMyOrders: async () => {
    const res = await apiClient.get<ServiceResponse<Order[]>>('/Orders/my-orders');
    return res.data.data || [];
  },
  getAll: async () => {
    const res = await apiClient.get<ServiceResponse<Order[]>>('/Orders');
    return res.data.data || [];
  },
  getById: async (id: number) => {
    const res = await apiClient.get<ServiceResponse<Order>>(`/Orders/${id}`);
    return res.data.data;
  },
  updateStatus: async (id: number, status: string) => {
    const res = await apiClient.patch<ServiceResponse<Order>>(`/Orders/${id}/status`, {
      status,
    });
    return res.data;
  },
};
