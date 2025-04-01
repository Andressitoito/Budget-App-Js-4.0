// src/app/pages/home/index.js
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { DndContext, closestCenter, useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import io from 'socket.io-client';
import useAppStore from '../../../stores/appStore';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../../../components/modals/Modal';
import TransactionItem from '../../../components/transactions/TransactionItem';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useQuery, useMutation } from '@tanstack/react-query';
import React from 'react';

// Helper function to convert ObjectIds to strings
const convertObjectIdsToStrings = (obj) => {
  const converted = { ...obj };
  for (const key in converted) {
    if (Object.prototype.hasOwnProperty.call(converted, key)) {
      if (converted[key] && typeof converted[key] === 'object' && (converted[key].buffer || typeof converted[key].toString === 'function')) {
        converted[key] = converted[key].toString();
      }
    }
  }
  return converted;
};

// Draggable Category Item
const CategoryItem = React.memo(({ category, isSelected, onSelect, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: category._id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-2 mb-2 rounded-md cursor-pointer flex justify-between items-center ${
        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-50'
      } hover:bg-blue-400`}
    >
      <span onClick={() => onSelect(category)}>{category.name}</span>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(category)}
          className="text-gray-600 hover:text-blue-600"
        >
          <FiEdit size={16} />
        </button>
        <button
          onClick={() => onDelete(category)}
          className="text-gray-600 hover:text-red-600"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
});

// Droppable Category List
function CategoryList({
  categories = [],
  selectedCategory,
  onSelect,
  setModalConfig,
  setIsModalOpen,
  onEditCategory,
  onDeleteCategory,
}) {
  const { setNodeRef } = useDroppable({
    id: 'categories',
  });

  return (
    <div
      ref={setNodeRef}
      className="absolute left-4 top-4 w-64 bg-white shadow-lg rounded-lg p-4 h-[calc(100vh-5rem)] overflow-y-auto z-10"
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Categories</h2>
      <button
        className="w-full bg-blue-600 text-white p-2 rounded-md mb-4 hover:bg-blue-700 flex items-center justify-center"
        onClick={() => {
          setModalConfig({
            title: 'Create Category',
            fields: [
              { label: 'Name', name: 'name', type: 'text', placeholder: 'Category Name' },
              { label: 'Base Amount', name: 'base_amount', type: 'number', placeholder: 'Base Amount' },
            ],
            endpoint: '/api/categories/create_category',
            method: 'POST',
            action: 'create category',
            initialData: { base_amount: 0 },
            organization_id: selectedCategory?.organization_id,
            submitLabel: 'Create',
          });
          setIsModalOpen(true);
        }}
      >
        <FiPlus size={16} className="mr-2" /> Add Category
      </button>
      {categories.length > 0 ? (
        categories.map((category) => (
          <CategoryItem
            key={category._id}
            category={category}
            isSelected={selectedCategory?._id === category._id}
            onSelect={onSelect}
            onEdit={onEditCategory}
            onDelete={onDeleteCategory}
          />
        ))
      ) : (
        <p className="text-gray-500">No categories yet</p>
      )}
    </div>
  );
}

export default function Home({ initialOrgs, initialCategories = [], initialTransactions = [], selectedOrgId }) {
  const {
    setSelectedOrgId,
    setCategories,
    setTransactions,
    addTransaction,
    removeTransactions,
    removeTransaction,
    addCategory,
    removeCategory,
    updateCategory,
    updateTransaction,
  } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState(initialCategories[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const [page, setPage] = useState(1);
  const transactionsPerPage = 10;

  // Fetch categories using React Query
  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories', selectedOrgId],
    queryFn: async () => {
      const res = await fetch(`/api/categories/get_all_categories?organization_id=${selectedOrgId}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.map(item => convertObjectIdsToStrings(item));
    },
    initialData: initialCategories,
  });

  // Fetch transactions using React Query
  const { data: transactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions', selectedOrgId],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/get_transactions_list?organization_id=${selectedOrgId}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      return data.transactions.map(item => convertObjectIdsToStrings(item));
    },
    initialData: initialTransactions,
  });

  // Mutations for CRUD operations
  const createTransactionMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/transactions/create_transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create transaction');
      return res.json();
    },
    onSuccess: () => {
      refetchTransactions();
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/categories/create_category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create category');
      return res.json();
    },
    onSuccess: () => {
      refetchCategories();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/categories/update_category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update category');
      return res.json();
    },
    onSuccess: () => {
      refetchCategories();
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/categories/delete_category', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onSuccess: () => {
      refetchCategories();
      refetchTransactions();
      setSelectedCategory(null); // Reset selected category after deletion
    },
  });

  // Socket.io setup
  useEffect(() => {
    setSelectedOrgId(selectedOrgId);
    setCategories(categories);
    setTransactions(transactions);

    const socket = io('http://localhost:3000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.io');
      socket.emit('joinOrganization', selectedOrgId);
    });

    const handleNewTransaction = (transaction) => {
      addTransaction(transaction);
      refetchTransactions();
    };

    const handleTransactionsDeleted = ({ category_id }) => {
      removeTransactions(category_id);
      refetchTransactions();
    };

    socket.on('newTransaction', handleNewTransaction);
    socket.on('transactionsDeleted', handleTransactionsDeleted);
    socket.on('newCategory', (category) => {
      addCategory(category);
      refetchCategories();
    });
    socket.on('categoryDeleted', ({ category_id }) => {
      removeCategory(category_id);
      removeTransactions(category_id);
      setSelectedCategory(categories.find((c) => c._id !== category_id) || null);
      refetchCategories();
      refetchTransactions();
    });
    socket.on('categoryUpdated', (updatedCategory) => {
      updateCategory(updatedCategory);
      refetchCategories();
    });
    socket.on('transactionUpdated', (transaction) => {
      updateTransaction(transaction);
      refetchTransactions();
    });
    socket.on('transactionDeleted', ({ transaction_id }) => {
      removeTransaction(transaction_id);
      refetchTransactions();
    });
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('newTransaction', handleNewTransaction);
      socket.off('transactionsDeleted', handleTransactionsDeleted);
      socket.off('newCategory');
      socket.off('categoryDeleted');
      socket.off('categoryUpdated');
      socket.off('transactionUpdated');
      socket.off('transactionDeleted');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [
    selectedOrgId,
    categories,
    transactions,
    setSelectedOrgId,
    setCategories,
    setTransactions,
    addTransaction,
    removeTransactions,
    removeTransaction,
    addCategory,
    removeCategory,
    updateCategory,
    updateTransaction,
    refetchCategories,
    refetchTransactions,
  ]);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = categories.findIndex((c) => c._id === active.id);
      const newIndex = categories.findIndex((c) => c._id === over.id);
      const reordered = arrayMove(categories, oldIndex, newIndex);

      setCategories(reordered);
    },
    [categories, setCategories]
  );

  const onSelectCategory = useCallback((category) => {
    setSelectedCategory(category);
    setPage(1); // Reset page when changing categories
  }, []);

  const onEditCategory = useCallback(
    (category) => {
      setModalConfig({
        title: 'Edit Category',
        fields: [
          { label: 'Name', name: 'name', type: 'text', value: category.name },
          { label: 'Base Amount', name: 'base_amount', type: 'number', value: category.base_amount },
        ],
        endpoint: '/api/categories/update_category',
        method: 'POST',
        action: 'update category',
        initialData: { category_id: category._id, name: category.name, base_amount: category.base_amount },
        organization_id: category.organization_id,
        submitLabel: 'Save',
      });
      setIsModalOpen(true);
    },
    [setModalConfig, setIsModalOpen]
  );

  const onDeleteCategory = useCallback(
    (category) => {
      setModalConfig({
        title: 'Confirm Delete Category',
        fields: [],
        endpoint: '/api/categories/delete_category',
        method: 'DELETE',
        action: 'delete category',
        initialData: { category_id: category._id },
        organization_id: category.organization_id,
        submitLabel: 'Delete',
      });
      setIsModalOpen(true);
    },
    [setModalConfig, setIsModalOpen]
  );

  // Filter and sort transactions for the selected category
  const filteredTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return transactions
      .filter((t) => t.category_id === selectedCategory._id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, selectedCategory]);

  // Paginate transactions for infinite scroll
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, page * transactionsPerPage);
  }, [filteredTransactions, page]);

  const hasMoreTransactions = paginatedTransactions.length < filteredTransactions.length;

  return (
    <div className="flex relative">
      {/* Left Sidebar - Categories */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={onSelectCategory}
          setModalConfig={setModalConfig}
          setIsModalOpen={setIsModalOpen}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
        />
      </DndContext>

      {/* Center Content */}
      <div className="w-3/4 p-6 flex flex-col items-center relative z-0">
        {selectedCategory ? (
          <>
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">{selectedCategory.name}</h3>
              <p className="text-lg">
                Base Amount: <span className="font-semibold">${selectedCategory.base_amount}</span>
              </p>
              <p className="text-lg">
                Remaining:{' '}
                <span
                  className={`font-semibold ${
                    selectedCategory.remaining_budget < 0 ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  ${selectedCategory.remaining_budget}
                </span>
              </p>
              <button
                className="mt-4 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                onClick={() => {
                  setModalConfig({
                    title: 'New Transaction',
                    fields: [
                      { label: 'Item', name: 'item', type: 'text', placeholder: 'Item' },
                      { label: 'Price', name: 'price', type: 'number', placeholder: 'Price' },
                    ],
                    endpoint: '/api/transactions/create_transaction',
                    method: 'POST',
                    action: 'create transaction',
                    initialData: { category_id: selectedCategory._id, username: 'Andrew' },
                    organization_id: selectedOrgId,
                    submitLabel: 'Add',
                  });
                  setIsModalOpen(true);
                }}
              >
                <FiPlus size={20} />
              </button>
            </div>

            <div className="mt-6 w-full max-w-md">
              {filteredTransactions.length > 0 ? (
                <InfiniteScroll
                  dataLength={paginatedTransactions.length}
                  next={() => setPage((prev) => prev + 1)}
                  hasMore={hasMoreTransactions}
                  loader={<h4 className="text-center text-gray-500">Loading...</h4>}
                  endMessage={<p className="text-center text-gray-500">No more transactions</p>}
                >
                  <ul className="space-y-4">
                    {paginatedTransactions.map((transaction) => (
                      <TransactionItem
                        key={transaction._id}
                        transaction={transaction}
                        refetchTransactions={refetchTransactions}
                      />
                    ))}
                  </ul>
                </InfiniteScroll>
              ) : (
                <p className="text-gray-500 text-center">No transactions found.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a category to view transactions.</p>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={modalConfig}
        onSubmit={() => {
          if (modalConfig?.action === 'create transaction') {
            createTransactionMutation.mutate({
              ...modalConfig.initialData,
              organization_id: selectedOrgId,
            });
          } else if (modalConfig?.action === 'create category') {
            createCategoryMutation.mutate({
              ...modalConfig.initialData,
              organization_id: selectedOrgId,
            });
          } else if (modalConfig?.action === 'update category') {
            updateCategoryMutation.mutate({
              ...modalConfig.initialData,
              organization_id: selectedOrgId,
            });
          } else if (modalConfig?.action === 'delete category') {
            deleteCategoryMutation.mutate({
              ...modalConfig.initialData,
              organization_id: selectedOrgId,
            });
          }
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}