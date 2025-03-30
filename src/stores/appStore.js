// stores/appStore.js
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  selectedOrgId: null,
  categories: [],
  transactions: [],
  setSelectedOrgId: (orgId) => set({ selectedOrgId: orgId }),
  setCategories: (categories) => set({ categories }),
  setTransactions: (transactions) => set({ transactions }), // Full overwrite
  addTransaction: (transaction) => set((state) => ({
    transactions: Array.isArray(state.transactions) ? [...state.transactions, transaction] : [transaction],
  })), // Incremental add
}));

export default useAppStore;