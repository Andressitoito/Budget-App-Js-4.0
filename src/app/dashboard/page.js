// src/app/dashboard/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import useAppStore from '../../stores/appStore';
import dynamic from 'next/dynamic';
import CategoryList from '../../components/category/CategoryList';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionModal from '../../components/transactions/TransactionModal';
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
    console.log('Dashboard - storeCategories:', storeCategories, 'storeTransactions:', storeTransactions, 'selectedCategory:', selectedCategory);

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
            const categoryWithTransactions = initialCategories.find(cat => 
              initialTransactions.some(t => t.category_id === cat._id)
            ) || initialCategories[0];
            setSelectedCategory(categoryWithTransactions);
          }
          isInitialMount.current = false;
        }

        if (transactionId === 'mock1' && !isTransactionModalOpen) {
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
          console.log('Socket newTransaction:', transaction);
        }
      });
      socket.on('transactionsDeleted', ({ category_id, deletedCount }) => {
        removeTransactions(category_id);
        const newTransactions = storeTransactions.filter(t => t.category_id !== category_id);
        setTransactions(newTransactions);
        console.log('Socket transactionsDeleted:', { category_id, deletedCount });
      });
      socket.on('newCategory', (category) => {
        if (category.organization_id.toString() === orgId) {
          addCategory(category);
          const updatedCategories = [...storeCategories.filter(c => c._id !== category._id), category];
          setCategories(updatedCategories);
          if (!selectedCategory) setSelectedCategory(category);
          console.log('Socket newCategory:', category);
        }
      });
      socket.on('categoryDeleted', ({ category_id }) => {
        removeCategory(category_id);
        removeTransactions(category_id);
        const newCategories = storeCategories.filter(c => c._id !== category_id);
        setCategories(newCategories);
        setSelectedCategory(newCategories[0] || null);
        console.log('Socket categoryDeleted:', { category_id });
      });
      socket.on('categoryUpdated', (updatedCategory) => {
        if (updatedCategory.organization_id.toString() === orgId) {
          updateCategory(updatedCategory);
          if (selectedCategory?._id === updatedCategory._id) {
            setSelectedCategory(updatedCategory);
          }
          console.log('Socket categoryUpdated:', updatedCategory);
        }
      });
      socket.on('transactionUpdated', (transaction) => {
        if (transaction.organization_id.toString() === orgId) {
          updateTransaction(transaction);
          const updatedTransactions = storeTransactions.map(t => 
            t._id === transaction._id ? transaction : t
          );
          setTransactions([...updatedTransactions]);
          console.log('Socket transactionUpdated:', transaction);
        }
      });
      socket.on('transactionDeleted', ({ transaction_id }) => {
        removeTransaction(transaction_id);
        const newTransactions = storeTransactions.filter(t => t._id !== transaction_id);
        setTransactions(newTransactions);
        console.log('Socket transactionDeleted:', { transaction_id });
      });
      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        toast.error('Lost connection to server, retrying...');
      });

      const handleOpenTransactionModal = (e) => {
        const transactionId = e.detail;
        console.log('Opening TransactionModal for:', transactionId);
        setIsTransactionModalOpen(true);
      };

      window.addEventListener('openTransactionModal', handleOpenTransactionModal);

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
        window.removeEventListener('openTransactionModal', handleOpenTransactionModal);
      };
    };

    loadInitialData();
  }, [orgId, token, userDataParam, router, setSelectedOrgId, setCategories, setTransactions, addTransaction, removeTransactions, removeTransaction, addCategory, removeCategory, updateCategory, updateTransaction, storeCategories, storeTransactions, selectedCategory]);

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

  const openCreateTransactionModal = () => {
    setModalConfig(createTransactionConfig(selectedCategory, orgId, userData?.username || userData?.email, token));
    setIsModalOpen(true);
  };

  const handleTransactionModalClose = () => {
    setIsTransactionModalOpen(false);
    router.replace(`/dashboard?orgId=${orgId}&token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  };

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
                onClick={openCreateTransactionModal}
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
              {Array.isArray(storeTransactions) && storeTransactions.filter(t => t.category_id === selectedCategory._id).length > 0 && (
                <button
                  className="absolute top-0 right-0 -mt-12 mr-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  onClick={openDeleteAllModal}
                >
                  <AiOutlineDelete size={20} />
                </button>
              )}
              <TransactionList
                transactions={storeTransactions}
                categoryId={selectedCategory?._id}
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
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleTransactionModalClose}
        categories={storeCategories}
        orgId={orgId}
        token={token}
        userData={userData}
        originalAmount={4000} // Mock for now
        onSubmit={handleTransactionModalClose}
      />
    </div>
  );
}