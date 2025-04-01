// src/app/api/categories/update_category/route.js
import { update_category } from '../../../../lib/api/categories/update_category';
import dbConnect from '../../../../lib/db';

export async function POST(req) {
  try {
    await dbConnect();
    const { category_id, name, base_amount, organization_id } = await req.json();
    if (!category_id || (!name && base_amount === undefined)) {
      return new Response(JSON.stringify({ error: 'Category ID and at least one field required' }), { status: 400 });
    }

    const updatedCategory = await update_category({ category_id, name, base_amount });

    if (global.io) {
      global.io.to(organization_id).emit('categoryUpdated', updatedCategory.toObject());
    }

    return new Response(JSON.stringify(updatedCategory.toObject()), { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}