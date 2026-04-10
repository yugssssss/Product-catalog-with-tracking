import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],

  add: (notification) => {
    const id = Date.now();
    set((s) => ({
      notifications: [{ id, ...notification, createdAt: new Date() }, ...s.notifications].slice(0, 20),
    }));
    return id;
  },

  remove: (id) => set((s) => ({
    notifications: s.notifications.filter((n) => n.id !== id),
  })),

  clear: () => set({ notifications: [] }),
}));
