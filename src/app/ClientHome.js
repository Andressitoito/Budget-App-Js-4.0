// src/app/ClientHome.js
"use client";

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import useAppStore from '../stores/appStore';
import CategoryList from '../components/category/CategoryList';
import Modal from '../components/Modal';

export default function ClientHome({ initialOrgs, initialCategories, initialTransactions, selectedOrgId }) {
  const { 
    setSelectedOrgId, setCategories, setTransactions, 
    addTransaction, removeTransactions, removeTransaction, 
    addCategory, removeCategory, updateCategory, updateTransaction 
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const createConfig = {
    title: 'Create Category',
    fields: [
      { label: 'Name', name: 'category', type: 'text', placeholder: 'Category Name' },
      { label: 'Base Amount', name: 'base_amount', type: 'number', placeholder: 'Base Amount' },
    ],
    endpoint: '/api/categories/create_category',
    method: 'POST',
    action: 'create category',
    initialData: { category: '', base_amount: 0 },
    organization_id: selectedOrgId,
    submitLabel: 'Create',
  };

  useEffect(() => {
    setSelectedOrgId(selectedOrgId);
    setCategories(initialCategories);
    setTransactions(initialTransactions);

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
    });
    socket.on('transactionsDeleted', ({ category_id, deletedCount }) => {
      console.log(`Transactions deleted for category ${category_id}, count: ${deletedCount}`);
      removeTransactions(category_id);
    });
    socket.on('newCategory', (category) => {
      console.log('New category received:', category);
      addCategory(category);
    });
    socket.on('categoryDeleted', ({ category_id }) => {
      console.log(`Category deleted: ${category_id}`);
      removeCategory(category_id);
      removeTransactions(category_id);
    });
    socket.on('categoryUpdated', (updatedCategory) => {
      console.log('Category updated:', updatedCategory);
      updateCategory(updatedCategory);
    });
    socket.on('transactionUpdated', (transaction) => {
      console.log('Transaction updated:', transaction);
      updateTransaction(transaction);
    });
    socket.on('transactionDeleted', ({ transaction_id }) => {
      console.log('Transaction deleted:', transaction_id);
      removeTransaction(transaction_id);
    });
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => socket.disconnect();
  }, [
    selectedOrgId, initialCategories, initialTransactions, 
    setSelectedOrgId, setCategories, setTransactions, 
    addTransaction, removeTransactions, removeTransaction, 
    addCategory, removeCategory, updateCategory, updateTransaction
  ]);

  console.log('Rendering with initialOrgs.length:', initialOrgs.length);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold">Budget App Js 4.0</h1>
      {initialOrgs.length ? (
        <>
          <h2 className="text-xl mt-4">Organization: {initialOrgs.find(org => org._id === selectedOrgId)?.organization || 'Unknown'}</h2>
          <button style={{ backgroundColor: 'green' }} onClick={() => { setModalConfig(createConfig); setIsModalOpen(true); }}>New Category</button>
          <CategoryList />
        </>
      ) : (
        <p className="mt-4">No organizations found. Create one to get started!</p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={modalConfig}
        onSubmit={() => setIsModalOpen(false)}
      />
    </div>
  );
}