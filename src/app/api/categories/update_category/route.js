// src/app/api/categories/update_category/route.js
import dbConnect from '../../../../lib/db';
import { Category } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { category_id, name, base_amount, organization_id } = await req.json();

    console.log('Updating category:', { category_id, name, base_amount, organization_id });

    if (!category_id || !name || base_amount === undefined || !organization_id) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    await dbConnect();
    const updatedCategory = await Category.findByIdAndUpdate(
      category_id,
      { name, base_amount },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }

    if (global.io) {
      const categoryData = updatedCategory.toObject();
      console.log('Emitting categoryUpdated:', { categoryData, to: organization_id });
      global.io.to(organization_id).emit('categoryUpdated', categoryData);
      console.log(`Emit sent to organization: ${organization_id}`);
    } else {
      console.error('Socket.IO not available');
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