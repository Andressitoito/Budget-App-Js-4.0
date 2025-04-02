// src/app/api/categories/update_category/route.js
import dbConnect from '../../../../lib/db';
import { Category } from '../../../../lib/models';

export async function POST(req) {
  try {
    await dbConnect();
    const { category_id, name, base_amount, organization_id } = await req.json();

    // Validate inputs
    if (!category_id) {
      return new Response(JSON.stringify({ error: 'Category ID is required' }), { status: 400 });
    }
    if (!name && base_amount === undefined) {
      return new Response(JSON.stringify({ error: 'At least one field (name or base_amount) is required to update' }), { status: 400 });
    }
    if (!organization_id) {
      return new Response(JSON.stringify({ error: 'Organization ID is required' }), { status: 400 });
    }

    // Find the category and ensure it belongs to the organization
    const category = await Category.findOne({ 
      _id: category_id, 
      organization_id 
    });
    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found or access denied' }), { status: 404 });
    }

    // Update fields if provided
    if (name) category.name = name;
    if (base_amount !== undefined) {
      category.base_amount = base_amount;
      category.remaining_budget = base_amount - category.spent_amount;
    }

    // Save the updated category
    await category.save();

    // Emit socket event with the updated category
    if (global.io) {
      global.io.to(organization_id).emit('categoryUpdated', category.toObject());
    }

    // Return the updated category
    return new Response(JSON.stringify(category.toObject()), { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}