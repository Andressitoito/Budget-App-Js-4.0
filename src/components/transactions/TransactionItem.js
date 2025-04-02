// src/components/transactions/TransactionItem.js
"use client";

import { useState } from 'react';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import dynamic from 'next/dynamic';

// Dynamic import for Modal, SSR disabled
const Modal = dynamic(() => import('../modals/Modal'), { ssr: false });

export default function TransactionItem({ transaction }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const editConfig = {
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
  };

  const deleteConfig = {
    title: 'Confirm Delete Transaction',
    fields: [],
    endpoint: '/api/transactions/delete_transaction',
    method: 'DELETE',
    action: 'delete transaction',
    initialData: { transaction_id: transaction._id },
    organization_id: transaction.organization_id,
    submitLabel: 'Delete',
  };

  const openModal = (type) => {
    setModalConfig(type === 'edit' ? editConfig : deleteConfig);
    setIsModalOpen(true);
  };

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
          onClick={() => openModal('edit')}
        >
          <AiOutlineEdit size={16} />
        </button>
        <button
          className="text-gray-600 hover:text-red-600"
          onClick={() => openModal('delete')}
        >
          <AiOutlineDelete size={16} />
        </button>
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          config={modalConfig}
          onSubmit={() => setIsModalOpen(false)} // Socket.io in index.js handles updates
        />
      )}
    </li>
  );
}