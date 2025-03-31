// src/components/transactions/TransactionItem.js
import { useState } from 'react';
import Modal from '../modals/Modal';

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
    <li>
      {transaction.item} - ${transaction.price}
      <button onClick={() => openModal('edit')}>Edit</button>
      <button onClick={() => openModal('delete')}>Delete</button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={modalConfig}
        onSubmit={() => setIsModalOpen(false)}
      />
    </li>
  );
}