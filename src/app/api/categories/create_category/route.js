// src/app/api/categories/create_category/route.js
import dbConnect from '../../../../lib/db';
import { Category } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { name, base_amount, organization_id } = await req.json();

    console.log('Creating category:', { name, base_amount, organization_id });

    if (!name || base_amount === undefined || !organization_id) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    await dbConnect();
    const category = new Category({ name, base_amount, remaining_budget: base_amount, organization_id });
    await category.save();
    console.log('Category created:', category._id);

    if (global.io) {
      const categoryData = category.toObject();
      console.log('Emitting newCategory:', { categoryData, to: organization_id });
      global.io.to(organization_id).emit('newCategory', categoryData);
      console.log(`Emit sent to organization: ${organization_id}`);
    } else {
      console.error('Socket.IO not available');
    }

    return new Response(JSON.stringify({ message: 'Category created', category: category.toObject() }), { status: 201 });
  } catch (error) {
    console.error('Create category error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}