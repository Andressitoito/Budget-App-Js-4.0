import { useState } from 'react';
import TransactionList from '../transactions/TransactionList';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../modals/Modal';
import { useMutation } from '@tanstack/react-query';

export default function CategoryBox({ category, transactions, refetchCategories, refetchTransactions }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const updateCategoryMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/categories/update_category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update category');
      return res.json();
    },
    onSuccess: () => {
      refetchCategories();
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/categories/delete_category', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onSuccess: () => {
      refetchCategories();
      refetchTransactions();
    },
  });

  const openModal = (type) => {
    setModalConfig(
      type === 'edit'
        ? {
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
          }
        : {
            title: 'Confirm Delete Category',
            fields: [],
            endpoint: '/api/categories/delete_category',
            method: 'DELETE',
            action: 'delete category',
            initialData: { category_id: category._id },
            organization_id: category.organization_id,
            submitLabel: 'Delete',
          }
    );
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
      <h2 className="text-2xl font-bold text-primary mb-2">{category.name}</h2>
      <p className="text-lg">Base Amount: <span className="font-semibold">${category.base_amount}</span></p>
      <p className="text-lg">
        Remaining Budget: <span className={`font-semibold ${category.remaining_budget < 0 ? 'text-danger' : 'text-success'}`}>
          ${category.remaining_budget}
        </span>
      </p>
      <div className="flex justify-center space-x-2 mt-4">
        <button
          className="bg-secondary text-white p-2 rounded-full hover:bg-secondary-hover"
          onClick={() => openModal('edit')}
        >
          <FiEdit size={16} />
        </button>
        <button
          className="bg-danger text-white p-2 rounded-full hover:bg-danger-hover"
          onClick={() => openModal('delete')}
        >
          <FiTrash2 size={16} />
        </button>
      </div>
      <div className="mt-6">
        <TransactionList
          transactions={transactions}
          categoryId={category._id}
          refetchTransactions={refetchTransactions}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={modalConfig}
        onSubmit={() => {
          setIsModalOpen(false);
          refetchCategories();
          refetchTransactions();
        }}
      />
    </div>
  );
}