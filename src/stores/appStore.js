// src/stores/appStore.js
import { create } from 'zustand';

const useAppStore = create((set) => ({
  selectedOrgId: null,
  categories: [],
  transactions: [],
  setSelectedOrgId: (id) => set({ selectedOrgId: id }),
  setCategories: (categories) => set({ categories }),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (updater) => set((state) => {
    if (typeof updater === 'function') return updater(state);
    const exists = state.transactions.some(t => t._id === updater._id);
    if (!exists) return { transactions: [...state.transactions, updater] };
    return state;
  }),
}));

export default useAppStore;