// src/lib/api/categories/update_category.js (optional, if you want to keep a helper)
import { Category } from '../../models';

export async function update_category({ category_id, name, base_amount }) {
  const category = await Category.findById(category_id);
  if (!category) throw new Error('Category not found');
  if (name) category.name = name;
  if (base_amount !== undefined) {
    category.base_amount = base_amount;
    category.remaining_budget = base_amount - category.spent_amount;
  }
  return await category.save();
}