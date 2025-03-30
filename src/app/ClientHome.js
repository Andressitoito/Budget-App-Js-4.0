// src/app/ClientHome.js
"use client";

import { useEffect } from 'react';
import io from 'socket.io-client';
import useAppStore from '../stores/appStore';
import CategoryList from '../components/category/CategoryList';
import TransactionList from '../components/transactions/TransactionList';

export default function ClientHome({ initialOrgs, initialCategories, initialTransactions, selectedOrgId }) {
  const { setSelectedOrgId, setCategories, setTransactions, addTransaction } = useAppStore();

  console.log('ClientHome props:', { initialOrgs, initialCategories, initialTransactions, selectedOrgId });

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
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
    return () => socket.disconnect();
  }, [selectedOrgId, initialCategories, initialTransactions, setSelectedOrgId, setCategories, setTransactions, addTransaction]);

  console.log('Rendering with initialOrgs.length:', initialOrgs.length);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold">Budget App Js 4.0</h1>
      {initialOrgs.length ? (
        <>
          <h2 className="text-xl mt-4">Organization: {initialOrgs.find(org => org._id === selectedOrgId)?.organization || 'Unknown'}</h2>
          <CategoryList />
          <TransactionList />
        </>
      ) : (
        <p className="mt-4">No organizations found. Create one to get started!</p>
      )}
    </div>
  );
}