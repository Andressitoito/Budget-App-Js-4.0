// src/app/api/categories/update_base_amount/route.js
import { Category } from '../../../../lib/models';
import dbConnect from '../../../../lib/db';

export async function POST(req) {
  try {
    await dbConnect();
    const { category_id, base_amount, organization_id } = await req.json();

    if (!category_id || base_amount === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const category = await Category.findById(category_id);
    if (!category) throw new Error('Category not found');
    category.base_amount = base_amount;
    category.remaining_budget = base_amount - category.spent_amount;
    await category.save();

    if (global.io) {
      global.io.to(organization_id).emit('categoryUpdated', category.toObject());
    }

    return new Response(JSON.stringify(category.toObject()), { status: 200 });
  } catch (error) {
    console.error('Error updating base amount:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}