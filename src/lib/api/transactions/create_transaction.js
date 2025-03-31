// src/lib/api/transactions/create_transaction.js
import { Transaction, Category } from '../../models';

export async function createTransaction({ category_id, organization_id, username, item, price }) {
  if (!category_id || !organization_id || !username || !item || !price) {
    throw new Error('Missing required fields');
  }

  const transaction = new Transaction({
    category_id,
    organization_id,
    username,
    item,
    price,
    date: new Date(),
  });
  await transaction.save();

  // Update category
  const category = await Category.findById(category_id);
  if (!category) throw new Error('Category not found');
  category.spent_amount += price;
  category.remaining_budget = category.base_amount - category.spent_amount;
  await category.save();

  return transaction;
}