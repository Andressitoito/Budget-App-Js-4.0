// src/app/api/transactions/delete_transaction/route.js
import dbConnect from '../../../../lib/db';
import { Transaction, Category } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function DELETE(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { transaction_id, organization_id } = await req.json();

    if (!transaction_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Transaction ID and Organization ID are required' }), { status: 400 });
    }

    await dbConnect();
    const transaction = await Transaction.findByIdAndDelete(transaction_id);
    if (!transaction) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404 });
    }

    // Update category remaining_budget
    const category = await Category.findById(transaction.category_id);
    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }
    category.remaining_budget += transaction.price;
    await category.save();

    if (global.io) {
      const deleteData = { transaction_id };
      const categoryData = category.toObject();
      global.io.to(organization_id).emit('transactionDeleted', deleteData);
      global.io.to(organization_id).emit('categoryUpdated', categoryData); // Sync budget
    }

    return new Response(JSON.stringify({ message: 'Transaction deleted' }), { status: 200 });
  } catch (error) {
    console.error('Delete transaction error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}