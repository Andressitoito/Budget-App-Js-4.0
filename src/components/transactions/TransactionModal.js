// src/components/transactions/TransactionModal.js
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { AiOutlinePlus } from 'react-icons/ai';
import { toast } from 'react-toastify';

export default function TransactionModal({ isOpen, onClose, categories, orgId, token, userData, originalAmount, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      splits: [{ item: 'Payment 1', price: originalAmount, extra: 0, category_id: '' }]
    }
  });
  const { fields, append } = useFieldArray({
    control,
    name: 'splits'
  });

  const splits = watch('splits');
  const remainingAmount = originalAmount - splits.slice(1).reduce((sum, split) => sum + (Number(split.price) || 0), 0);

  const addSplit = () => {
    append({ item: fields[0].item, price: '', extra: '', category_id: '' });
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    const totalPrice = data.splits.reduce((sum, split) => sum + (Number(split.price) || 0), 0);
    if (totalPrice !== originalAmount) {
      toast.error('Total split prices must equal original transaction amount (excluding extras)');
      setIsSubmitting(false);
      return;
    }

    try {
      for (const split of data.splits) {
        const response = await fetch('/api/transactions/create_transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            item: split.item,
            price: (Number(split.price) || 0) + (Number(split.extra) || 0),
            category_id: split.category_id,
            organization_id: orgId,
            username: userData?.username || userData?.email,
          }),
        });
        if (!response.ok) throw new Error('Failed to create transaction');
      }

      toast.success('Transactions added successfully');
      onSubmit();
      reset({ splits: [{ item: 'Payment 1', price: originalAmount, extra: 0, category_id: '' }] }); // Reset form
    } catch (error) {
      console.error('Error adding transactions:', error);
      toast.error('Failed to add transactions');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto relative">
        <h2 className="text-xl font-bold mb-4">Manage Incoming Transaction</h2>
        <div className="absolute top-6 right-6 bg-gray-100 p-2 rounded text-gray-700 text-sm z-50">
          Amount: <span className="text-green-500">${originalAmount}</span>
          <br />
          Remaining: <span className={remainingAmount < 0 ? 'text-red-500' : 'text-green-500'}>${remainingAmount}</span>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {fields.map((field, index) => (
            <div key={field.id} className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Item</label>
              <input
                {...register(`splits.${index}.item`, { required: 'Item is required' })}
                className="w-full p-2 border rounded mb-2"
              />
              {errors.splits?.[index]?.item && <p className="text-red-500 text-xs">{errors.splits[index].item.message}</p>}
              
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                {...register(`splits.${index}.price`, { required: 'Price is required', valueAsNumber: true })}
                className="w-full p-2 border rounded mb-2"
                placeholder="0"
              />
              {errors.splits?.[index]?.price && <p className="text-red-500 text-xs">{errors.splits[index].price.message}</p>}
              
              <label className="block text-sm font-medium text-gray-700">Extra</label>
              <input
                type="number"
                {...register(`splits.${index}.extra`, { valueAsNumber: true })}
                className="w-full p-2 border rounded mb-2"
                placeholder="0"
              />
              
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                {...register(`splits.${index}.category_id`, { required: 'Category is required' })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.splits?.[index]?.category_id && <p className="text-red-500 text-xs">{errors.splits[index].category_id.message}</p>}
            </div>
          ))}
          <button
            type="button"
            onClick={addSplit}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 mb-4"
          >
            <AiOutlinePlus size={20} />
          </button>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : null}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}