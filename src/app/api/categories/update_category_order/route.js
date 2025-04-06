// src/app/api/categories/update_category_order/route.js
import dbConnect from '../../../../lib/db';
import { Category } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { orderedCategories } = await req.json();

    if (!Array.isArray(orderedCategories) || orderedCategories.length === 0) {
      return new Response(JSON.stringify({ error: 'Ordered categories array is required' }), { status: 400 });
    }

    await dbConnect();

    // Update each category's position
    const updates = orderedCategories.map((cat, index) => ({
      updateOne: {
        filter: { _id: cat._id },
        update: { position: index }
      }
    }));
    await Category.bulkWrite(updates);

    // Emit updated categories to sync clients
    const updatedCategories = await Category.find({ _id: { $in: orderedCategories.map(c => c._id) } });
    if (global.io) {
      const orgId = orderedCategories[0].organization_id; // Assume all same org
      updatedCategories.forEach(cat => {
        global.io.to(orgId).emit('categoryUpdated', cat.toObject());
      });
    }

    return new Response(JSON.stringify({ message: 'Category order updated' }), { status: 200 });
  } catch (error) {
    console.error('Update category order error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}