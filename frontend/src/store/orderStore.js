import { create } from 'zustand';
import api from '../utils/api';

export const useOrderStore = create((set, get) => ({
  orders:     [],
  order:      null,
  meta:       null,
  isLoading:  false,
  error:      null,
  filters: { page: 1, limit: 10, status: '' },

  setFilters: (f) => {
    set((s) => ({ filters: { ...s.filters, ...f, page: 1 } }));
    get().fetchOrders();
  },

  setPage: (page) => {
    set((s) => ({ filters: { ...s.filters, page } }));
    get().fetchOrders();
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const f = get().filters;
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v !== '') params.set(k, v); });
      const { data } = await api.get(`/orders?${params}`);
      set({ orders: data.data, meta: data.meta, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch orders', isLoading: false });
    }
  },

  fetchOrder: async (id) => {
    set({ isLoading: true, order: null });
    try {
      const { data } = await api.get(`/orders/${id}`);
      set({ order: data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Not found', isLoading: false });
    }
  },

  placeOrder: async (items) => {
    try {
      const { data } = await api.post('/orders', { items });
      set((s) => ({ orders: [data.data, ...s.orders] }));
      return { success: true, data: data.data };
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors ? errors[0]?.message : err.response?.data?.message || 'Failed to place order';
      return { success: false, message: msg };
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      set((s) => ({
        orders: s.orders.map((o) => (o._id === id ? data.data : o)),
        order:  s.order?._id === id ? data.data : s.order,
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update' };
    }
  },

  // Called from socket event — update order status in real-time
  realtimeUpdateStatus: (orderId, newStatus) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o._id === orderId ? { ...o, status: newStatus } : o
      ),
      order: s.order?._id === orderId
        ? { ...s.order, status: newStatus }
        : s.order,
    }));
  },

  clearError: () => set({ error: null }),
}));
