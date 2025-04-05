// src/app/api/categories/delete_category/route.js
import dbConnect from '../../../../lib/db';
import { Category } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function DELETE(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { category_id, organization_id } = await req.json();

    console.log('Deleting category:', { category_id, organization_id });

    if (!category_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Category ID and Organization ID are required' }), { status: 400 });
    }

    await dbConnect();
    const result = await Category.findByIdAndDelete(category_id);
    if (!result) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }
    console.log(`Deleted category: ${category_id}`);

    if (global.io) {
      const deleteData = { category_id };
      console.log('Emitting categoryDeleted:', { deleteData, to: organization_id });
      global.io.to(organization_id).emit('categoryDeleted', deleteData);
      console.log(`Emit sent to organization: ${organization_id}`);
    } else {
      console.error('Socket.IO not available');
    }

    return new Response(JSON.stringify({ message: 'Category deleted' }), { status: 200 });
  } catch (error) {
    console.error('Delete category error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}