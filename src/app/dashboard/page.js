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
  const isInitialMount = useRef(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');
  const token = searchParams.get('token');
  const userDataParam = searchParams.get('user');
  const [userData, setUserData] = useState(userDataParam ? JSON.parse(decodeURIComponent(userDataParam)) : null);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) {
        console.log('No token, redirecting to /');
        toast.error('Session invalid, please log in again');
        router.push('/');
        return;
      }

      console.log('UserData from URL param:', userData);

      // Always fetch fresh userData from API to sync with DB
      try {
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        setUserData(data.user);
        console.log('Fetched userData from API:', data.user);
        router.push(`/dashboard?orgId=${data.user.defaultOrgId}&token=${token}&user=${encodeURIComponent(JSON.stringify(data.user))}`);
      } catch (error) {
        console.error('Fetch user error:', error);
        toast.error('Please log in again');
        router.push('/');
        return;
      }

      console.log('Dashboard loaded with:', { userData, orgId });

      if (isInitialMount.current) {
        setSelectedOrgId(orgId);
        const initialCategories = (userData.categories || []).filter(c => c.organization_id.toString() === orgId);
        const initialTransactions = (userData.transactions || []).filter(t => t.organization_id.toString() === orgId);
        setCategories(initialCategories);
        setTransactions(initialTransactions);
        console.log('Initial state set:', { categories: initialCategories, transactions: initialTransactions });
        if (initialCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(initialCategories[0]);
        }
        isInitialMount.current = false;
      }

      console.log('Emitting joinOrganization:', orgId);
      socket.emit('joinOrganization', orgId);

      socket.on('connect', () => {
        console.log('Connected to Socket.io, socket.id:', socket.id);
        console.log('Socket rooms on connect:', Array.from(socket.rooms));
      });

      socket.on('newTransaction', (transaction) => {
        console.log('Received newTransaction:', transaction);
        if (transaction.organization_id.toString() === orgId) {
          addTransaction(transaction);
          const updatedTransactions = [...storeTransactions.filter(t => t._id !== transaction._id), transaction];
          setTransactions(updatedTransactions);
          console.log('Zustand transactions updated:', updatedTransactions);
        } else {
          console.log('Transaction ignored - wrong orgId:', transaction.organization_id, 'expected:', orgId);
        }
      });

      socket.on('transactionsDeleted', ({ category_id, deletedCount }) => {
        console.log(`Received transactionsDeleted: category_id=${category_id}, deletedCount=${deletedCount}`);
        removeTransactions(category_id);
        const newTransactions = storeTransactions.filter(t => t.category_id !== category_id);
        setTransactions(newTransactions);
        console.log('Zustand transactions updated after delete:', newTransactions);
      });

      socket.on('newCategory', (category) => {
        console.log('Received newCategory:', category);
        if (category.organization_id.toString() === orgId) {
          addCategory(category);
          const updatedCategories = [...storeCategories.filter(c => c._id !== category._id), category];
          setCategories(updatedCategories);
          if (!selectedCategory) setSelectedCategory(category);
          console.log('Zustand categories updated:', updatedCategories);
        } else {
          console.log('Category ignored - wrong orgId:', category.organization_id);
        }
      });

      socket.on('categoryDeleted', ({ category_id }) => {
        console.log(`Received categoryDeleted: category_id=${category_id}`);
        removeCategory(category_id);
        removeTransactions(category_id);
        const newCategories = storeCategories.filter(c => c._id !== category_id);
        setCategories(newCategories);
        setSelectedCategory(newCategories[0] || null);
        console.log('Zustand categories updated after delete:', newCategories);
      });

      socket.on('categoryUpdated', (updatedCategory) => {
        console.log('Received categoryUpdated:', updatedCategory);
        if (updatedCategory.organization_id.toString() === orgId) {
          updateCategory(updatedCategory);
          if (selectedCategory?._id === updatedCategory._id) {
            setSelectedCategory(updatedCategory);
          }
          const updatedCategories = [...storeCategories];
          setCategories(updatedCategories);
          console.log('Zustand categories updated:', updatedCategories);
        }
      });

      socket.on('transactionUpdated', (transaction) => {
        console.log('Received transactionUpdated:', transaction);
        if (transaction.organization_id.toString() === orgId) {
          updateTransaction(transaction);
          const updatedTransactions = storeTransactions.map(t => 
            t._id === transaction._id ? transaction : t
          );
          setTransactions([...updatedTransactions]);
          console.log('Zustand transactions updated:', updatedTransactions);
        } else {
          console.log('Transaction update ignored - wrong orgId:', transaction.organization_id);
        }
      });

      socket.on('transactionDeleted', ({ transaction_id }) => {
        console.log(`Received transactionDeleted: transaction_id=${transaction_id}`);
        removeTransaction(transaction_id);
        const newTransactions = storeTransactions.filter(t => t._id !== transaction_id);
        setTransactions(newTransactions);
        console.log('Zustand transactions updated after delete:', newTransactions);
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
  }, [
    orgId, token, userData, userDataParam, router, setSelectedOrgId, setCategories, 
    setTransactions, addTransaction, removeTransactions, removeTransaction, 
    addCategory, removeCategory, updateCategory, updateTransaction, 
    storeCategories, storeTransactions, selectedCategory
  ]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const reorderedCategories = [...storeCategories];
    const [movedCategory] = reorderedCategories.splice(source.index, 1);
    reorderedCategories.splice(destination.index, 0, movedCategory);
    setCategories(reorderedCategories);
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
                refetchTransactions={() => {}} // Placeholder, socket handles updates
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
    </div>
  );
}