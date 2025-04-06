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
  removeTransactions: (categoryId) => set((state) => ({
    transactions: state.transactions.filter(t => t.category_id !== categoryId),
  })),
  removeTransaction: (transactionId) => set((state) => ({
    transactions: state.transactions.filter(t => t._id !== transactionId),
  })),
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category],
  })),
  removeCategory: (categoryId) => set((state) => ({
    categories: state.categories.filter(c => c._id !== categoryId),
  })),
  updateCategory: (updatedCategory) => set((state) => ({
    categories: state.categories.map(c => c._id === updatedCategory._id ? updatedCategory : c),
  })),
  updateTransaction: (transaction) => set((state) => ({
    transactions: state.transactions.map((t) =>
      t._id === transaction._id ? { ...t, item: transaction.item, price: transaction.price } : t // Preserve date, only update item/price
    ),
  })),
}));

export default useAppStore;