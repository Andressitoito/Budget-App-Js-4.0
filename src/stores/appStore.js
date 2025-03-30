// src/stores/appStore.js
import { create } from 'zustand';

const useAppStore = create((set) => ({
  selectedOrgId: null,
  categories: [],
  transactions: [],
  setSelectedOrgId: (id) => set({ selectedOrgId: id }),
  setCategories: (categories) => set({ categories }),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({
    transactions: [...state.transactions, transaction],
  })),
}));

export default useAppStore;