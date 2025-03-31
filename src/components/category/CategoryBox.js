// src/components/category/CategoryBox.js
import { useState } from 'react';
import useAppStore from '../../stores/appStore';
import TransactionItem from '../transactions/TransactionItem';
import Modal from '../modals/Modal';

export default function CategoryBox({ category }) {
  const { transactions } = useAppStore();
  const categoryTransactions = transactions.filter(t => t.category_id === category._id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const baseAmountConfig = {
    title: 'Edit Base Amount',
    fields: [
      { label: 'Base Amount', name: 'base_amount', type: 'number', value: category.base_amount },
    ],
    endpoint: '/api/categories/update_base_amount',
    method: 'POST',
    action: 'update base amount',
    initialData: { category_id: category._id, base_amount: category.base_amount },
    organization_id: category.organization_id,
    submitLabel: 'Save',
  };

  const editConfig = {
    title: 'Edit Category',
    fields: [
      { label: 'Name', name: 'name', type: 'text', value: category.name },
      { label: 'Base Amount', name: 'base_amount', type: 'number', value: category.base_amount },
    ],
    endpoint: '/api/categories/update_category',
    method: 'POST',
    action: 'update category',
    initialData: { category_id: category._id, name: category.name, base_amount: category.base_amount },
    organization_id: category.organization_id,
    submitLabel: 'Save',
  };

  const deleteConfig = {
    title: 'Confirm Delete Category',
    fields: [],
    endpoint: '/api/categories/delete_category',
    method: 'DELETE',
    action: 'delete category',
    initialData: { category_id: category._id },
    organization_id: category.organization_id,
    submitLabel: 'Delete',
  };

  const openModal = (type) => {
    setModalConfig(
      type === 'base' ? baseAmountConfig :
      type === 'edit' ? editConfig : deleteConfig
    );
    setIsModalOpen(true);
  };

  return (
    <div>
      <h4>{category.name}</h4>
      <p>Base Amount: ${category.base_amount}</p>
      <button onClick={() => openModal('base')}>Edit Base Amount</button>
      <button style={{ backgroundColor: 'yellow' }} onClick={() => openModal('edit')}>Edit</button>
      <button style={{ backgroundColor: 'red' }} onClick={() => openModal('delete')}>Delete</button>
      <ul>
        {categoryTransactions.map((transaction) => (
          <TransactionItem key={transaction._id} transaction={transaction} />
        ))}
      </ul>
      <p>Remaining Budget: ${category.remaining_budget}</p>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={modalConfig}
        onSubmit={() => setIsModalOpen(false)}
      />
    </div>
  );
}