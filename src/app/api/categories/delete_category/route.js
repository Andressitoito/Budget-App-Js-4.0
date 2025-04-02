// src/app/api/categories/delete_category/route.js
import dbConnect from '../../../../lib/db';
import { Category, Transaction } from '../../../../lib/models';

export async function DELETE(req) {
  try {
    await dbConnect();
    const { category_id, organization_id } = await req.json();

    console.log('category_id:', category_id);
    console.log('organization_id:', organization_id);

    if (!category_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Category ID and Organization ID required' }), { status: 400 });
    }

    await Transaction.deleteMany({ category_id });
    await Category.deleteOne({ _id: category_id });

    if (global.io) {
      global.io.to(organization_id).emit('categoryDeleted', { category_id });
      console.log(`Emitted categoryDeleted to org ${organization_id}`);
    }

    return new Response(JSON.stringify({ message: 'Category and its transactions deleted' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}