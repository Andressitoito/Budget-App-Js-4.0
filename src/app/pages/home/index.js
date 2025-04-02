// src/app/pages/home/index.js
"use client";

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import useAppStore from '../../../stores/appStore';
import dynamic from 'next/dynamic';
import CategoryList from '../../../components/category/CategoryList';
import TransactionList from '../../../components/transactions/TransactionList';
import { createTransactionConfig, createCategoryConfig, editCategoryConfig, deleteCategoryConfig } from './configs';
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

// Dynamic import for Modal, SSR disabled
const Modal = dynamic(() => import('../../../components/modals/Modal'), { ssr: false });

export default function Home({ initialCategories = [], initialTransactions = [], selectedOrgId }) {
  const { 
    categories: storeCategories, 
    transactions: storeTransactions, 
    setSelectedOrgId, setCategories, setTransactions, 
    addTransaction, removeTransactions, removeTransaction, 
    addCategory, removeCategory, updateCategory, updateTransaction 
  } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState(initialCategories[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    console.log('start use effect');
    console.log('Initial categories:', initialCategories);

    if (isInitialMount.current) {
      setSelectedOrgId(selectedOrgId);
      setCategories(initialCategories);
      setTransactions(initialTransactions);
      if (!selectedCategory && initialCategories.length > 0) {
        setSelectedCategory(initialCategories[0]);
      }
      isInitialMount.current = false;
    }

    const socket = io('http://localhost:3000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.io');
      socket.emit('joinOrganization', selectedOrgId);
    });
    socket.on('newTransaction', (transaction) => {
      console.log('New transaction received:', transaction);
      addTransaction(transaction);
      setTransactions([...storeTransactions.filter(t => t._id !== transaction._id), transaction]);
    });
    socket.on('transactionsDeleted', ({ category_id, deletedCount }) => {
      console.log(`Transactions deleted for category ${category_id}, count: ${deletedCount}`);
      removeTransactions(category_id);
      setTransactions([...storeTransactions.filter(t => t.category_id !== category_id)]);
    });
    socket.on('newCategory', (category) => {
      console.log('New category received:', category);
      addCategory(category);
      setCategories([...storeCategories.filter(c => c._id !== category._id), category]);
    });
    socket.on('categoryDeleted', ({ category_id }) => {
      console.log(`Category deleted: ${category_id}`);
      removeCategory(category_id);
      removeTransactions(category_id);
      const newCategories = storeCategories.filter(c => c._id !== category_id);
      setCategories(newCategories);
      console.log('Categories after deletion:', newCategories);
      setSelectedCategory(newCategories[0] || null);
    });
    socket.on('categoryUpdated', (updatedCategory) => {
      console.log('Category updated:', updatedCategory);
      updateCategory(updatedCategory);
      if (selectedCategory?._id === updatedCategory._id) {
        setSelectedCategory(updatedCategory);
      }
      setCategories([...storeCategories]);
    });
    socket.on('transactionUpdated', (transaction) => {
      console.log('Transaction updated:', transaction);
      updateTransaction(transaction);
      const updatedTransactions = storeTransactions.map(t => t._id === transaction._id ? transaction : t);
      setTransactions(updatedTransactions);
    });
    socket.on('transactionDeleted', ({ transaction_id }) => {
      console.log('Transaction deleted:', transaction_id);
      removeTransaction(transaction_id);
      setTransactions([...storeTransactions.filter(t => t._id !== transaction_id)]);
    });
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => socket.disconnect();
  }, [
    selectedOrgId, 
    setSelectedOrgId, setCategories, setTransactions, 
    addTransaction, removeTransactions, removeTransaction, 
    addCategory, removeCategory, updateCategory, updateTransaction,
    storeCategories, storeTransactions
  ]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const reorderedCategories = [...storeCategories];
    const [movedCategory] = reorderedCategories.splice(source.index, 1);
    reorderedCategories.splice(destination.index, 0, movedCategory);
    setCategories(reorderedCategories); // Fresh array for UI update
  };

  const openCreateModal = () => {
    setModalConfig(createCategoryConfig(selectedOrgId));
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <CategoryList
        categories={storeCategories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
        openCreateModal={openCreateModal}
        onDragEnd={handleDragEnd}
      />
      <div className="w-1/2 p-6 flex flex-col items-center relative mt-16 z-0">
        {selectedCategory ? (
          <>
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center relative">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">{selectedCategory.name}</h3>
              <p className="text-lg">Base Amount: <span className="font-semibold">${selectedCategory.base_amount}</span></p>
              <p className="text-lg">
                Remaining: <span className={`font-semibold ${selectedCategory.remaining_budget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ${selectedCategory.remaining_budget}
                </span>
              </p>
              <button
                className="mt-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                onClick={() => { setModalConfig(createTransactionConfig(selectedCategory, selectedOrgId)); setIsModalOpen(true); }}
              >
                <AiOutlinePlus size={20} />
              </button>
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600"
                  onClick={() => { setModalConfig(editCategoryConfig(selectedCategory, selectedOrgId)); setIsModalOpen(true); }}
                >
                  <AiOutlineEdit size={20} />
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  onClick={() => { setModalConfig(deleteCategoryConfig(selectedCategory, selectedOrgId)); setIsModalOpen(true); }}
                >
                  <AiOutlineDelete size={20} />
                </button>
              </div>
            </div>
            <div className="mt-6 w-full max-w-md">
              <TransactionList
                transactions={storeTransactions}
                categoryId={selectedCategory._id}
              />
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a category to view details</p>
        )}
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          config={modalConfig}
          onSubmit={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}