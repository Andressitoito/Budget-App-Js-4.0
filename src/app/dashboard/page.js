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
  const [selectedOrgId, setLocalOrgId] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const isInitialMount = useRef(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrgId = searchParams.get('orgId');

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        console.log('Fetching orgs with credentials...');
        const res = await fetch('/api/users/orgs', { 
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        console.log('Fetch response:', { status: res.status, headers: res.headers.get('Set-Cookie') });
        const data = await res.json();
        console.log('Fetch data:', data);
        if (res.ok) {
          setOrgs(data.orgs);
          const orgId = initialOrgId || data.orgs.find(o => o._id === data.defaultOrgId)?._id || data.orgs[0]?._id;
          if (orgId) {
            setLocalOrgId(orgId);
            setSelectedOrgId(orgId);
          } else {
            console.log('No orgId found, redirecting to /');
            router.push('/');
          }
        } else {
          throw new Error(data.error || 'Unauthorized');
        }
      } catch (error) {
        console.error('Fetch orgs error:', error);
        toast.error('Please log in again');
        router.push('/');
      }
    };
    fetchOrgs();

    if (isInitialMount.current && selectedOrgId) {
      const socket = io('http://localhost:3000', {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Connected to Socket.io');
        socket.emit('joinOrganization', selectedOrgId);
      });
      socket.on('newTransaction', (transaction) => {
        addTransaction(transaction);
        setTransactions([...storeTransactions.filter(t => t._id !== transaction._id), transaction]);
      });
      socket.on('transactionsDeleted', ({ category_id, deletedCount }) => {
        removeTransactions(category_id);
        setTransactions([...storeTransactions.filter(t => t.category_id !== category_id)]);
      });
      socket.on('newCategory', (category) => {
        addCategory(category);
        setCategories([...storeCategories.filter(c => c._id !== category._id), category]);
      });
      socket.on('categoryDeleted', ({ category_id }) => {
        removeCategory(category_id);
        removeTransactions(category_id);
        const newCategories = storeCategories.filter(c => c._id !== category_id);
        setCategories(newCategories);
        setSelectedCategory(newCategories[0] || null);
      });
      socket.on('categoryUpdated', (updatedCategory) => {
        updateCategory(updatedCategory);
        if (selectedCategory?._id === updatedCategory._id) {
          setSelectedCategory(updatedCategory);
        }
        setCategories([...storeCategories]);
      });
      socket.on('transactionUpdated', (transaction) => {
        updateTransaction(transaction);
        const updatedTransactions = storeTransactions.map(t => t._id === transaction._id ? transaction : t);
        setTransactions(updatedTransactions);
      });
      socket.on('transactionDeleted', ({ transaction_id }) => {
        removeTransaction(transaction_id);
        setTransactions([...storeTransactions.filter(t => t._id !== transaction_id)]);
      });
      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      isInitialMount.current = false;
      return () => socket.disconnect();
    }
  }, [
    selectedOrgId, setSelectedOrgId, setCategories, setTransactions, 
    addTransaction, removeTransactions, removeTransaction, 
    addCategory, removeCategory, updateCategory, updateTransaction,
    storeCategories, storeTransactions, router, initialOrgId
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
    setModalConfig(createCategoryConfig(selectedOrgId));
    setIsModalOpen(true);
  };

  const openDeleteAllModal = () => {
    setModalConfig({
      title: 'Confirm Delete All Transactions',
      fields: [],
      endpoint: '/api/transactions/delete_all_transactions',
      method: 'DELETE',
      action: 'delete all transactions',
      initialData: { category_id: selectedCategory?._id, organization_id: selectedOrgId },
      organization_id: selectedOrgId,
      submitLabel: 'Delete All',
    });
    setIsModalOpen(true);
  };

  const handleOrgChange = async (orgId, setAsDefault = false) => {
    setLocalOrgId(orgId);
    setSelectedOrgId(orgId);
    if (setAsDefault) {
      await fetch('/api/users/set_default_org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
        credentials: 'include',
      });
      toast.success('Default organization updated');
    }
    router.push(`/dashboard?orgId=${orgId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-4xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Organizations</h2>
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          {orgs.map(org => (
            <div key={org._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <span className="text-gray-700">{org.name} ({org.role})</span>
                <p className="text-sm text-gray-500">Owner: {org.ownerUsername}</p>
                <p className="text-sm text-gray-500">Members: {org.members.map(m => m.username).join(', ')}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={org._id === selectedOrgId}
                  onChange={() => handleOrgChange(org._id, true)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  onClick={() => handleOrgChange(org._id)}
                >
                  Go
                </button>
              </div>
            </div>
          ))}
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
                onClick={openCreateModal}
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