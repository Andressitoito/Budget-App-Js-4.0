// src/app/api/categories/create_category/route.js
import dbConnect from '../../../../lib/db';
import { Category, User } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { name, base_amount, organization_id } = await req.json();

    if (!name || base_amount === undefined || !organization_id) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    await dbConnect();
    const category = new Category({ name, base_amount, remaining_budget: base_amount, organization_id });
    await category.save();

    // Update user's categoryOrder
    const user = await User.findById(authResult.userId);
    const orderEntry = user.categoryOrder.find(o => o.organizationId.toString() === organization_id);
    if (orderEntry) {
      orderEntry.order.push(category._id.toString());
    } else {
      user.categoryOrder.push({ organizationId: organization_id, order: [category._id.toString()] });
    }
    await user.save();

    if (global.io) {
      const categoryData = category.toObject();
      global.io.to(organization_id).emit('newCategory', categoryData);
    }

    return new Response(JSON.stringify({ message: 'Category created', category: category.toObject() }), { status: 201 });
  } catch (error) {
    console.error('Create category error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
