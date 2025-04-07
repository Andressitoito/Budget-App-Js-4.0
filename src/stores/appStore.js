// src/stores/appStore.js
import { create } from 'zustand';

const useAppStore = create((set) => ({
  selectedOrgId: null,
  categories: [],
  transactions: [],
  setSelectedOrgId: (id) => set({ selectedOrgId: id }),
  setCategories: (categories) => {
    console.log('setCategories:', categories);
    return set({ categories: Array.isArray(categories) ? [...categories] : [] });
  },
  setTransactions: (transactions) => {
    console.log('setTransactions:', transactions);
    return set({ transactions: Array.isArray(transactions) ? [...transactions] : [] });
  },
  addTransaction: (updater) => set((state) => {
    if (typeof updater === 'function') return updater(state);
    const exists = state.transactions.some(t => t._id === updater._id);
    if (!exists) {
      const newTransactions = [...state.transactions, updater];
      console.log('addTransaction:', newTransactions);
      return { transactions: newTransactions };
    }
    console.log('addTransaction: duplicate skipped', updater);
    return state;
  }),
  removeTransactions: (categoryId) => set((state) => {
    const newTransactions = state.transactions.filter(t => t.category_id !== categoryId);
    console.log('removeTransactions:', newTransactions);
    return { transactions: newTransactions };
  }),
  removeTransaction: (transactionId) => set((state) => {
    const newTransactions = state.transactions.filter(t => t._id !== transactionId);
    console.log('removeTransaction:', newTransactions);
    return { transactions: newTransactions };
  }),
  addCategory: (category) => set((state) => {
    const newCategories = [...state.categories, category];
    console.log('addCategory:', newCategories);
    return { categories: newCategories };
  }),
  removeCategory: (categoryId) => set((state) => {
    const newCategories = state.categories.filter(c => c._id !== categoryId);
    console.log('removeCategory:', newCategories);
    return { categories: newCategories };
  }),
  updateCategory: (updatedCategory) => set((state) => {
    const newCategories = state.categories.map(c => 
      c._id === updatedCategory._id ? { ...updatedCategory } : { ...c }
    );
    console.log('updateCategory:', newCategories);
    return { categories: newCategories };
  }),
  updateTransaction: (transaction) => set((state) => {
    const newTransactions = state.transactions.map(t =>
      t._id === transaction._id ? { ...t, item: transaction.item, price: transaction.price } : { ...t }
    );
    console.log('updateTransaction:', newTransactions);
    return { transactions: newTransactions };
  }),
}));

export default useAppStore;