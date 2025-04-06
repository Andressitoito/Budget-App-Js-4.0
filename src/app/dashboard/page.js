// src/app/dashboard/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import useAppStore from '../../stores/appStore';
import dynamic from 'next/dynamic';
import CategoryList from '../../components/category/CategoryList';
import TransactionList from '../../components/transactions/TransactionList';
import { createTransactionConfig, createCategoryConfig, editCategoryConfig, deleteCategoryConfig } from './configs';
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

const Modal = dynamic(() => import('../../components/modals/Modal'), { ssr: false });

const socket = io('http://localhost:3000', {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default function Dashboard() {
  const { 
    categories: storeCategories, 
    transactions: storeTransactions, 
    setSelectedOrgId, setCategories, setTransactions, 
    addTransaction, removeTransactions, removeTransaction, 
    addCategory, removeCategory, updateCategory, updateTransaction 
  } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionSplits, setTransactionSplits] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInitialMount = useRef(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');
  const token = searchParams.get('token');
  const userDataParam = searchParams.get('user');
  const transactionId = searchParams.get('transaction');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) {
        toast.error('Session invalid, please log in again');
        router.push('/');
        return;
      }

      try {
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        const fetchedUserData = data.user;
        const minimalUserData = {
          _id: fetchedUserData._id,
          email: fetchedUserData.email,
          given_name: fetchedUserData.given_name,
          family_name: fetchedUserData.family_name,
          username: fetchedUserData.username,
          defaultOrgId: fetchedUserData.defaultOrgId,
          defaultOrgName: fetchedUserData.defaultOrgName
        };
        router.push(`/dashboard?orgId=${fetchedUserData.defaultOrgId}&token=${token}&user=${encodeURIComponent(JSON.stringify(minimalUserData))}${transactionId ? `&transaction=${transactionId}` : ''}`);
        setUserData(fetchedUserData);

        if (isInitialMount.current) {
          setSelectedOrgId(orgId);
          const initialCategories = (fetchedUserData.categories || []).filter(c => c.organization_id.toString() === orgId);
          const initialTransactions = (fetchedUserData.transactions || []).filter(t => t.organization_id.toString() === orgId);
          setCategories(initialCategories);
          setTransactions(initialTransactions);
          if (initialCategories.length > 0 && !selectedCategory) {
            setSelectedCategory(initialCategories[0]);
          }
          isInitialMount.current = false;
        }

        if (transactionId === 'mock1') {
          setTransactionSplits([{ item: 'Payment 1', price: 4000, extra: 0, category_id: '' }]);
          setIsTransactionModalOpen(true);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Please log in again');
        router.push('/');
        return;
      } finally {
        setIsLoading(false);
      }

      socket.emit('joinOrganization', orgId);

      socket.on('connect', () => {});
      socket.on('newTransaction', (transaction) => {
        if (transaction.organization_id.toString() === orgId) {
          addTransaction(transaction);
          const updatedTransactions = [...storeTransactions.filter(t => t._id !== transaction._id), transaction];
          setTransactions(updatedTransactions);
        }
      });
      socket.on('transactionsDeleted', ({ category_id, deletedCount }) => {
        removeTransactions(category_id);
        const newTransactions = storeTransactions.filter(t => t.category_id !== category_id);
        setTransactions(newTransactions);
      });
      socket.on('newCategory', (category) => {
        if (category.organization_id.toString() === orgId) {
          addCategory(category);
          const updatedCategories = [...storeCategories.filter(c => c._id !== category._id), category];
          setCategories(updatedCategories);
          if (!selectedCategory) setSelectedCategory(category);
        }
      });
      socket.on('categoryDeleted', ({ category_id }) => {
        removeCategory(category_id);
        removeTransactions(category_id);
        const newCategories = storeCategories.filter(c => c._id !== category_id);
        setCategories(newCategories);
        setSelectedCategory(newCategories[0] || null);
      });
      socket.on('categoryUpdated', (updatedCategory) => {
        if (updatedCategory.organization_id.toString() === orgId) {
          updateCategory(updatedCategory);
          if (selectedCategory?._id === updatedCategory._id) {
            setSelectedCategory(updatedCategory);
          }
        }
      });
      socket.on('transactionUpdated', (transaction) => {
        if (transaction.organization_id.toString() === orgId) {
          updateTransaction(transaction);
          const updatedTransactions = storeTransactions.map(t => 
            t._id === transaction._id ? transaction : t
          );
          setTransactions([...updatedTransactions]);
        }
      });
      socket.on('transactionDeleted', ({ transaction_id }) => {
        removeTransaction(transaction_id);
        const newTransactions = storeTransactions.filter(t => t._id !== transaction_id);
        setTransactions(newTransactions);
      });
      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        toast.error('Lost connection to server, retrying...');
      });

      return () => {
        socket.off('connect');
        socket.off('newTransaction');
        socket.off('transactionsDeleted');
        socket.off('newCategory');
        socket.off('categoryDeleted');
        socket.off('categoryUpdated');
        socket.off('transactionUpdated');
        socket.off('transactionDeleted');
        socket.off('connect_error');
      };
    };

    loadInitialData();
  }, [orgId, token, userDataParam, transactionId, router, setSelectedOrgId, setCategories, setTransactions, addTransaction, removeTransactions, removeTransaction, addCategory, removeCategory, updateCategory, updateTransaction, storeCategories, storeTransactions, selectedCategory]);

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const reorderedCategories = [...storeCategories];
    const [movedCategory] = reorderedCategories.splice(source.index, 1);
    reorderedCategories.splice(destination.index, 0, movedCategory);
    setCategories(reorderedCategories);

    try {
      const response = await fetch('/api/users/update_category_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          organization_id: orgId, 
          categoryOrder: reorderedCategories.map(c => c._id) 
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save category order: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving category order:', error);
      toast.error('Failed to save category order');
    }
  };

  const openCreateModal = () => {
    setModalConfig(createCategoryConfig(orgId, token));
    setIsModalOpen(true);
  };

  const openDeleteAllModal = () => {
    setModalConfig({
      title: 'Confirm Delete All Transactions',
      fields: [],
      endpoint: '/api/transactions/delete_all_transactions',
      method: 'DELETE',
      action: 'delete all transactions',
      initialData: { category_id: selectedCategory?._id, organization_id: orgId },
      organization_id: orgId,
      token,
      submitLabel: 'Delete All',
    });
    setIsModalOpen(true);
  };

  const addSplit = () => {
    setTransactionSplits([...transactionSplits, { item: transactionSplits[0].item, price: '', extra: '', category_id: '' }]);
  };

  const updateSplit = (index, field, value) => {
    const updatedSplits = [...transactionSplits];
    updatedSplits[index][field] = value === '' || isNaN(value) ? '' : Number(value);
    if (index === 0 && field === 'price') {
      // Keep first split as original, adjust others
      const remaining = transactionSplits[0].price - value;
      const otherSplits = updatedSplits.slice(1);
      const perSplit = otherSplits.length > 0 ? remaining / otherSplits.length : 0;
      otherSplits.forEach(split => split.price = perSplit >= 0 ? perSplit : 0);
    }
    setTransactionSplits(updatedSplits);
  };

  const handleTransactionSubmit = async () => {
    setIsSubmitting(true);
    const totalPrice = transactionSplits.reduce((sum, split) => sum + (split.price || 0), 0);
    if (totalPrice !== transactionSplits[0].price) {
      toast.error('Total split prices must equal original transaction amount (excluding extras)');
      setIsSubmitting(false);
      return;
    }

    try {
      for (const split of transactionSplits) {
        const response = await fetch('/api/transactions/create_transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            item: split.item,
            price: (split.price || 0) + (split.extra || 0),
            category_id: split.category_id,
            organization_id: orgId,
            username: userData?.username || userData?.email,
          }),
        });
        if (!response.ok) throw new Error('Failed to create transaction');
      }

      toast.success('Transactions added successfully');
      setIsTransactionModalOpen(false);
      router.push(`/dashboard?orgId=${orgId}&token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } catch (error) {
      console.error('Error adding transactions:', error);
      toast.error('Failed to add transactions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingAmount = transactionSplits.length > 0 
    ? transactionSplits[0].price - transactionSplits.slice(1).reduce((sum, split) => sum + (split.price || 0), 0)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="absolute top-16 left-4 w-64 bg-gray-200 rounded-lg p-4 z-10 animate-pulse" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded mb-2"></div>
          ))}
        </div>
        <div className="w-1/2 p-6 flex flex-col items-center relative mt-16 z-0">
          <div className="bg-gray-200 p-4 rounded-lg shadow-md mb-6 w-full max-w-md animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/3"></div>
          </div>
          <div className="bg-gray-200 shadow-md rounded-lg p-6 w-full max-w-md animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-8 bg-gray-300 rounded-full w-8 mx-auto"></div>
          </div>
          <div className="mt-6 w-full max-w-md animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 w-full max-w-md">
          <p className="text-gray-700">Welcome, {userData?.given_name} {userData?.family_name}</p>
          <p className="text-sm text-gray-500">
            Organization: {userData?.defaultOrgName || 'Unknown'}
          </p>
        </div>
        {selectedCategory ? (
          <>
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center relative">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">{selectedCategory.name}</h3>
              <p className="text-lg">Base Amount: <span className="font-semibold">${selectedCategory.base_amount}</span></p>
              <p className="text-lg">Spent: <span className="font-semibold">${selectedCategory.base_amount - selectedCategory.remaining_budget}</span></p>
              <p className="text-lg">
                Remaining: <span className={`font-semibold ${selectedCategory.remaining_budget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ${selectedCategory.remaining_budget}
                </span>
              </p>
              <button
                className="mt-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                onClick={() => { 
                  setModalConfig(createTransactionConfig(selectedCategory, orgId, userData?.username || userData?.email, token)); 
                  setIsModalOpen(true); 
                }}
              >
                <AiOutlinePlus size={20} />
              </button>
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600"
                  onClick={() => { setModalConfig(editCategoryConfig(selectedCategory, orgId, token)); setIsModalOpen(true); }}
                >
                  <AiOutlineEdit size={20} />
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  onClick={() => { setModalConfig(deleteCategoryConfig(selectedCategory, orgId, token)); setIsModalOpen(true); }}
                >
                  <AiOutlineDelete size={20} />
                </button>
              </div>
            </div>
            <div className="mt-6 w-full max-w-md relative">
              {storeTransactions.filter(t => t.category_id === selectedCategory._id).length > 0 && (
                <button
                  className="absolute top-0 right-0 -mt-12 mr-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  onClick={openDeleteAllModal}
                >
                  <AiOutlineDelete size={20} />
                </button>
              )}
              <TransactionList
                transactions={storeTransactions}
                categoryId={selectedCategory._id}
                refetchTransactions={() => {}}
                token={token}
                orgId={orgId}
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
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto relative">
            <h2 className="text-xl font-bold mb-4">Manage Incoming Transaction</h2>
            <div className="absolute top-6 right-6 bg-gray-100 p-2 rounded text-gray-700 text-sm">
              Remaining: <span className={remainingAmount < 0 ? 'text-red-500' : 'text-green-500'}>${remainingAmount}</span>
            </div>
            {transactionSplits.map((split, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Item</label>
                <input
                  type="text"
                  value={split.item}
                  onChange={(e) => updateSplit(index, 'item', e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={split.price}
                  onChange={(e) => updateSplit(index, 'price', e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="0"
                />
                <label className="block text-sm font-medium text-gray-700">Extra</label>
                <input
                  type="number"
                  value={split.extra}
                  onChange={(e) => updateSplit(index, 'extra', e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="0"
                />
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={split.category_id}
                  onChange={(e) => updateSplit(index, 'category_id', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  {storeCategories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            ))}
            <button
              onClick={addSplit}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 mb-4"
            >
              <AiOutlinePlus size={20} />
            </button>
            <div className="flex justify-between">
              <button
                onClick={() => setIsTransactionModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleTransactionSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : null}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}