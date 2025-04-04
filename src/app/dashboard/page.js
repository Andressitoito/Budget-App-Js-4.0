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

      if (!userData) {
        // Fetch user data if not in URL (e.g., after refresh)
        try {
          const res = await fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to fetch user data');
          const data = await res.json();
          setUserData(data.user);
          router.push(`/dashboard?orgId=${data.user.defaultOrgId}&token=${token}&user=${encodeURIComponent(JSON.stringify(data.user))}`);
        } catch (error) {
          console.error('Fetch user error:', error);
          toast.error('Please log in again');
          router.push('/');
          return;
        }
      }

      console.log('Dashboard loaded with:', { userData, orgId });

      if (isInitialMount.current) {
        setSelectedOrgId(orgId);
        setCategories([]); // Start empty, socket will populate
        setTransactions([]);
        isInitialMount.current = false;
      }

      const socket = io('http://localhost:3000', {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Connected to Socket.io');
        socket.emit('joinOrganization', orgId);
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
        if (!selectedCategory) setSelectedCategory(category);
      });
      socket.on('categoryDeleted', ({ category_id }) => {
        console.log(`Category deleted: ${category_id}`);
        removeCategory(category_id);
        removeTransactions(category_id);
        const newCategories = storeCategories.filter(c => c._id !== category_id);
        setCategories(newCategories);
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
    setModalConfig(createCategoryConfig(orgId));
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
            Organization: {userData?.organizations.find(o => o.organization.toString() === orgId)?.name || 'Loading...'}
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
                  setModalConfig(createTransactionConfig(selectedCategory, orgId, userData?.username || userData?.email)); 
                  setIsModalOpen(true); 
                }}
              >
                <AiOutlinePlus size={20} />
              </button>
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600"
                  onClick={() => { setModalConfig(editCategoryConfig(selectedCategory, orgId)); setIsModalOpen(true); }}
                >
                  <AiOutlineEdit size={20} />
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  onClick={() => { setModalConfig(deleteCategoryConfig(selectedCategory, orgId)); setIsModalOpen(true); }}
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