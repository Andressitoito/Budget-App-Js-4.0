// src/app/api/transactions/delete_all_transactions/route.js
import dbConnect from '../../../../lib/db';
import { Transaction, Category } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function DELETE(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { category_id, organization_id } = await req.json();

    if (!category_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Category ID and Organization ID are required' }), { status: 400 });
    }

    await dbConnect();
    const deleted = await Transaction.deleteMany({ category_id, organization_id });
    
    const category = await Category.findById(category_id);
    if (category) {
      category.remaining_budget = category.base_amount; // Reset to base_amount
      await category.save();
    }

    if (global.io) {
      global.io.to(organization_id).emit('transactionsDeleted', { category_id, deletedCount: deleted.deletedCount });
      if (category) {
        global.io.to(organization_id).emit('categoryUpdated', category.toObject());
      }
    }

    return new Response(JSON.stringify({ message: 'Transactions deleted', deletedCount: deleted.deletedCount }), { status: 200 });
  } catch (error) {
    console.error('Delete all transactions error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}