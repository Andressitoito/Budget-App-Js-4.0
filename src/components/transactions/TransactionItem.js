// src/components/transactions/TransactionItem.js
import { useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../Modal';

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
    initialData: { transaction_id: transaction._id, item: transaction.item, price: transaction.price },
    organization_id: transaction.organization_id,
    submitLabel: 'Save',
  };

  const deleteConfig = {
    title: 'Confirm Delete',
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
    <li className="bg-white p-4 rounded-md shadow-md flex justify-between items-center hover:bg-green-50 transition">
      <div>
        <p className="font-semibold text-blue-700">{transaction.username}</p>
        <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleString()}</p>
        <p className="text-gray-700">{transaction.item}</p>
      </div>
      <div className="flex space-x-2">
        <button
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          onClick={() => openModal('edit')}
        >
          <FiEdit size={16} />
        </button>
        <button
          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
          onClick={() => openModal('delete')}
        >
          <FiTrash2 size={16} />
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={modalConfig}
        onSubmit={() => setIsModalOpen(false)}
      />
    </li>
  );
}