import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import { connectSocket, disconnectSocket } from '../utils/socket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,
      error:        null,

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          const { user, accessToken, refreshToken } = data.data;
          localStorage.setItem('accessToken',  accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          connectSocket(accessToken);
          set({ user, accessToken, refreshToken, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          return { success: false, message: msg };
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = data.data;
          localStorage.setItem('accessToken',  accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          connectSocket(accessToken);
          set({ user, accessToken, refreshToken, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ error: msg, isLoading: false });
          return { success: false, message: msg };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', { refreshToken: get().refreshToken });
        } catch { /* ignore */ }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        disconnectSocket();
        set({ user: null, accessToken: null, refreshToken: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data });
        } catch { get().logout(); }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);
