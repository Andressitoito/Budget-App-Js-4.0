// src/lib/api/transactions/update_transaction.js
import { Transaction, Category } from '../../models';

export async function updateTransaction({ transaction_id, item, price }) {
  if (!transaction_id || !item || price === undefined) {
    throw new Error('Missing required fields');
  }

  const transaction = await Transaction.findById(transaction_id);
  if (!transaction) throw new Error('Transaction not found');

  const oldPrice = transaction.price;
  transaction.item = item;
  transaction.price = price;
  await transaction.save();

  const category = await Category.findById(transaction.category_id);
  if (!category) throw new Error('Category not found');
  category.spent_amount = category.spent_amount - oldPrice + price;
  category.remaining_budget = category.base_amount - category.spent_amount;
  await category.save();

  return transaction;
}