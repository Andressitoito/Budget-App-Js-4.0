// src/app/pages/home/index.js
"use client";

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import io from 'socket.io-client';
import useAppStore from '../../stores/appStore';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../../components/Modal';
import TransactionItem from '../../components/transactions/TransactionItem';

export default function Home({ initialOrgs, initialCategories, initialTransactions, selectedOrgId }) {
  const { 
    setSelectedOrgId, setCategories, setTransactions, addTransaction, removeTransactions, 
    removeTransaction, addCategory, removeCategory, updateCategory, updateTransaction 
  } = useAppStore();
  const [categories, setLocalCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  useEffect(() => {
    setSelectedOrgId(selectedOrgId);
    setCategories(initialCategories);
    setTransactions(initialTransactions);
    setSelectedCategory(initialCategories[0] || null);

    const socket = io('http://localhost:3000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('joinOrganization', selectedOrgId);
    });
    socket.on('newTransaction', (transaction) => addTransaction(transaction));
    socket.on('transactionsDeleted', ({ category_id }) => removeTransactions(category_id));
    socket.on('newCategory', (category) => addCategory(category));
    socket.on('categoryDeleted', ({ category_id }) => {
      removeCategory(category_id);
      removeTransactions(category_id);
      setSelectedCategory(categories.find(c => c._id !== category_id) || null);
    });
    socket.on('categoryUpdated', (updatedCategory) => updateCategory(updatedCategory));
    socket.on('transactionUpdated', (transaction) => updateTransaction(transaction));
    socket.on('transactionDeleted', ({ transaction_id }) => removeTransaction(transaction_id));
    socket.on('connect_error', (err) => console.error('Socket error:', err));

    return () => socket.disconnect();
  }, [
    selectedOrgId, initialCategories, initialTransactions, 
    setSelectedOrgId, setCategories, setTransactions, 
    addTransaction, removeTransactions, removeTransaction, 
    addCategory, removeCategory, updateCategory, updateTransaction
  ]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(categories);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setLocalCategories(reordered);
    setCategories(reordered); // Sync with store
  };

  const createTransactionConfig = {
    title: 'New Transaction',
    fields: [
      { label: 'Item', name: 'item', type: 'text', placeholder: 'Item' },
      { label: 'Price', name: 'price', type: 'number', placeholder: 'Price' },
    ],
    endpoint: '/api/transactions/create_transaction',
    method: 'POST',
    action: 'create transaction',
    initialData: { category_id: selectedCategory?._id, username: 'Andrew' }, // Placeholder user
    organization_id: selectedOrgId,
    submitLabel: 'Add',
  };

  const createCategoryConfig = {
    title: 'Create Category',
    fields: [
      { label: 'Name', name: 'name', type: 'text', placeholder: 'Category Name' },
      { label: 'Base Amount', name: 'base_amount', type: 'number', placeholder: 'Base Amount' },
    ],
    endpoint: '/api/categories/create_category',
    method: 'POST',
    action: 'create category',
    initialData: { base_amount: 0 },
    organization_id: selectedOrgId,
    submitLabel: 'Create',
  };

  const editCategoryConfig = {
    title: 'Edit Category',
    fields: [
      { label: 'Name', name: 'name', type: 'text', value: selectedCategory?.name },
      { label: 'Base Amount', name: 'base_amount', type: 'number', value: selectedCategory?.base_amount },
    ],
    endpoint: '/api/categories/update_category',
    method: 'POST',
    action: 'update category',
    initialData: { category_id: selectedCategory?._id, name: selectedCategory?.name, base_amount: selectedCategory?.base_amount },
    organization_id: selectedOrgId,
    submitLabel: 'Save',
  };

  const deleteCategoryConfig = {
    title: 'Confirm Delete Category',
    fields: [],
    endpoint: '/api/categories/delete_category',
    method: 'DELETE',
    action: 'delete category',
    initialData: { category_id: selectedCategory?._id },
    organization_id: selectedOrgId,
    submitLabel: 'Delete',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 fixed w-full top-0 z-10">
        <div className="container mx-auto flex justify-between">
          <span className="text-xl font-bold">Budget App Js 4.0</span>
          <div>
            <button className="bg-blue-800 px-3 py-1 rounded-md">Home</button>
            <button className="ml-2 px-3 py-1 rounded-md opacity-50">Charts</button>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Left Sidebar - Categories */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div
                className="w-1/4 bg-white shadow-md p-4 h-screen overflow-y-auto"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <h2 className="text-lg font-semibold mb-4">Categories</h2>
                {categories.map((category, index) => (
                  <Draggable key={category._id} draggableId={category._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-2 mb-2 rounded-md cursor-pointer ${selectedCategory?._id === category._id ? 'bg-green-200' : 'bg-gray-50'} hover:bg-green-100`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category.name}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <button
                  className="mt-4 bg-green-500 text-white p-2 rounded-md w-full hover:bg-green-600"
                  onClick={() => { setModalConfig(createCategoryConfig); setIsModalOpen(true); }}
                >
                  New Category
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Center Content */}
        <div className="w-2/4 p-6 flex flex-col items-center">
          {selectedCategory ? (
            <>
              <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
                <h3 className="text-2xl font-bold text-blue-700 mb-2">{selectedCategory.name}</h3>
                <p className="text-lg">Base Amount: <span className="font-semibold">${selectedCategory.base_amount}</span></p>
                <p className="text-lg">
                  Remaining: <span className={`font-semibold ${selectedCategory.remaining_budget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ${selectedCategory.remaining_budget}
                  </span>
                </p>
                <button
                  className="mt-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                  onClick={() => { setModalConfig(createTransactionConfig); setIsModalOpen(true); }}
                >
                  <FiPlus size={20} />
                </button>
              </div>

              <div className="mt-6 w-full max-w-md">
                {initialTransactions.filter(t => t.category_id === selectedCategory._id).length > 0 && (
                  <ul className="space-y-4">
                    {initialTransactions
                      .filter(t => t.category_id === selectedCategory._id)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((transaction) => (
                        <TransactionItem key={transaction._id} transaction={transaction} />
                      ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a category to view details</p>
          )}
        </div>

        {/* Right Sidebar - Actions */}
        {selectedCategory && (
          <div className="w-1/4 bg-white shadow-md p-4 h-screen">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <button
              className="bg-yellow-500 text-white p-2 rounded-md w-full mb-2 hover:bg-yellow-600"
              onClick={() => { setModalConfig(editCategoryConfig); setIsModalOpen(true); }}
            >
              Edit Category
            </button>
            <button
              className="bg-red-500 text-white p-2 rounded-md w-full hover:bg-red-600"
              onClick={() => { setModalConfig(deleteCategoryConfig); setIsModalOpen(true); }}
            >
              Delete Category
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={modalConfig}
        onSubmit={() => setIsModalOpen(false)}
      />
    </div>
  );
}