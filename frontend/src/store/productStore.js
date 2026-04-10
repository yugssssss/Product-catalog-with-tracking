import { create } from 'zustand';
import api from '../utils/api';

export const useProductStore = create((set, get) => ({
  products:    [],
  product:     null,
  meta:        null,
  isLoading:   false,
  isCached:    false,
  error:       null,
  filters: {
    page: 1, limit: 12, search: '', category: '',
    minPrice: '', maxPrice: '', sort: '-createdAt',
  },

  setFilters: (filters) => {
    set((s) => ({ filters: { ...s.filters, ...filters, page: 1 } }));
    get().fetchProducts();
  },

  setPage: (page) => {
    set((s) => ({ filters: { ...s.filters, page } }));
    get().fetchProducts();
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const f = get().filters;
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v !== '') params.set(k, v); });
      const { data } = await api.get(`/products?${params}`);
      set({ products: data.data, meta: data.meta, isCached: !!data.cached, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch', isLoading: false });
    }
  },

  fetchProduct: async (id) => {
    set({ isLoading: true, product: null });
    try {
      const { data } = await api.get(`/products/${id}`);
      set({ product: data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Not found', isLoading: false });
    }
  },

  createProduct: async (payload) => {
    try {
      const { data } = await api.post('/products', payload);
      await get().fetchProducts();
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create' };
    }
  },

  updateProduct: async (id, payload) => {
    try {
      const { data } = await api.put(`/products/${id}`, payload);
      set((s) => ({
        products: s.products.map((p) => (p._id === id ? data.data : p)),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update' };
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.delete(`/products/${id}`);
      set((s) => ({ products: s.products.filter((p) => p._id !== id) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete' };
    }
  },

  clearError: () => set({ error: null }),
}));
