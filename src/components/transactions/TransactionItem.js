// src/components/transactions/TransactionItem.js
import { useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../modals/Modal';
import { useMutation } from '@tanstack/react-query';

export default function TransactionItem({ transaction, refetchTransactions }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const updateTransactionMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/transactions/update_transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      return res.json();
    },
    onSuccess: () => {
      refetchTransactions();
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/transactions/delete_transaction', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to delete transaction');
      return res.json();
    },
    onSuccess: () => {
      refetchTransactions();
    },
  });

  return (
    <li className="bg-gray-50 p-4 rounded-md shadow-sm flex justify-between items-center">
      <div>
        <p className="font-medium text-gray-800">{transaction.item}</p>
        <p className="text-gray-600">${transaction.price}</p>
        <p className="text-gray-500 text-sm">{new Date(transaction.date).toLocaleDateString()}</p>
      </div>
      <div className="flex space-x-2">
        <button
          className="text-gray-600 hover:text-blue-600"
          onClick={() => {
            setModalConfig({
              title: 'Edit Transaction',
              fields: [
                { label: 'Item', name: 'item', type: 'text', value: transaction.item },
                { label: 'Price', name: 'price', type: 'number', value: transaction.price },
              ],
              endpoint: '/api/transactions/update_transaction',
              method: 'POST',
              action: 'update transaction',
              initialData: {
                transaction_id: transaction._id,
                item: transaction.item,
                price: transaction.price,
              },
              organization_id: transaction.organization_id,
              submitLabel: 'Save',
            });
            setIsModalOpen(true);
          }}
        >
          <FiEdit size={16} />
        </button>
        <button
          className="text-gray-600 hover:text-red-600"
          onClick={() => {
            setModalConfig({
              title: 'Confirm Delete Transaction',
              fields: [],
              endpoint: '/api/transactions/delete_transaction',
              method: 'DELETE',
              action: 'delete transaction',
              initialData: { transaction_id: transaction._id },
              organization_id: transaction.organization_id,
              submitLabel: 'Delete',
            });
            setIsModalOpen(true);
          }}
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={modalConfig}
        onSubmit={() => {
          if (modalConfig?.action === 'update transaction') {
            updateTransactionMutation.mutate({
              ...modalConfig.initialData,
              organization_id: transaction.organization_id,
            });
          } else if (modalConfig?.action === 'delete transaction') {
            deleteTransactionMutation.mutate({
              ...modalConfig.initialData,
              organization_id: transaction.organization_id,
            });
          }
          setIsModalOpen(false);
        }}
      />
    </li>
  );
}