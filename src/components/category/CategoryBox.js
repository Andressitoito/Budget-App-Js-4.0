// src/components/category/CategoryBox.js
import { useState } from 'react';
import useAppStore from '../../stores/appStore';
import TransactionItem from '../transactions/TransactionItem';

export default function CategoryBox({ category }) {
  const { transactions } = useAppStore();
  const categoryTransactions = transactions.filter(t => t.category_id === category._id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBaseAmount, setNewBaseAmount] = useState(category.base_amount);

  const updateBaseAmount = async () => {
    try {
      const response = await fetch('/api/categories/update_base_amount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: category._id,
          base_amount: Number(newBaseAmount),
          organization_id: category.organization_id,
        }),
      });
      if (!response.ok) throw new Error('Failed to update base amount');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating base amount:', error);
    }
  };

  return (
    <div>
      <h4>{category.name}</h4>
      <p>Base Amount: ${category.base_amount}</p>
      <button onClick={() => setIsModalOpen(true)}>Edit Base Amount</button>
      <ul>
        {categoryTransactions.map((transaction) => (
          <TransactionItem key={transaction._id} transaction={transaction} />
        ))}
      </ul>
      <p>Remaining Budget: ${category.remaining_budget}</p>

      {isModalOpen && (
        <div>
          <input
            type="number"
            value={newBaseAmount}
            onChange={(e) => setNewBaseAmount(e.target.value)}
          />
          <button onClick={updateBaseAmount}>Save</button>
          <button onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}