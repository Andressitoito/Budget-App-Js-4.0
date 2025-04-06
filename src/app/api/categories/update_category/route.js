// src/app/api/categories/update_category/route.js
import dbConnect from '../../../../lib/db';
import { Category, Transaction } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { category_id, name, base_amount, organization_id } = await req.json();

    if (!category_id || !name || base_amount === undefined || !organization_id) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    await dbConnect();
    const category = await Category.findById(category_id);
    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }

    // Calculate remaining_budget: new base_amount - total transaction prices
    const transactions = await Transaction.find({ category_id });
    const totalSpent = transactions.reduce((sum, t) => sum + t.price, 0);
    const updatedCategory = await Category.findByIdAndUpdate(
      category_id,
      { name, base_amount, remaining_budget: base_amount - totalSpent },
      { new: true, runValidators: true }
    );

    if (global.io) {
      const categoryData = updatedCategory.toObject();
      global.io.to(organization_id).emit('categoryUpdated', categoryData);
    }

    return new Response(JSON.stringify({
      message: `${name} was successfully updated`,
      category: updatedCategory.toObject(),
    }), { status: 200 });
  } catch (error) {
    console.error('Update category error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}